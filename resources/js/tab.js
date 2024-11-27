Senate.PageTab = Ext.extend(Ext.TabPanel, {
    id: 'page-tab',
    border: false,
    currentTab: 0,
    currentPage: 0,
    //frame: true,

    initComponent: function () {
        var tab = this;
        var mmID = this.mmID;
        var body = this.mainBody;
        var currentTab = this.currentTab;
        var currentPage = this.currentPage;

        this.listeners = {
            'beforetabchange': function (tabPanel, t) {
                var panel = Ext.getCmp('main-form');
                if (!t.check && panel && (get_formMode() == 2 || get_formMode() == 1)) {
                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to leave this page?', function (btn) {
                        if (btn == 'yes') {
                            t.check = true;
                            tabPanel.setActiveTab(t.id);
                        }
                    });
                    return false;
                }
            },
            'tabchange': function (tabPanel, t) {
                t.check = false;

                if (t.fmID != null) {
                    t.removeAll();
                    if (t.fmID == Senate.qn) {
                        var tab = new Senate.QNTab({
                            mainBody: body,
                            tabBody: t
                        });
                        t.add(tab.items.get(0));
                    }
                    else {
                        t.add(new Senate.MainForm({
                            fmID: t.fmID,
                            parentPage: t,
                            mainBody: body
                        }));
                    }
                    t.doLayout();
                }
                else {
                    var tb = t.getTopToolbar();
                    for (var i = 0; i < tb.items.length; i++) {
                        tb.get(i).toggle(false);
                    }
                    if (tb.get(currentPage) != undefined) {
                        tb.get(currentPage).toggle(true);
                    }
                }
            }
        };

        body.showLoading();

        Ext.Ajax.request({
            url: 'json/Tab.aspx',
            method: 'GET',
            params: { pmmID: mmID },
            success: function (result) {
                var json = Ext.util.JSON.decode(result.responseText);
                var data = json.data;

                var panel = new Array();
                var toolbar = new Array();
                for (var i = 0; i < data.length; i++) {
                    var cells = data[i];
                    if (cells.pseq == null) {
                        if (cells.fmID != null) {
                            tab.add(new Ext.Panel({
                                title: cells.lbName,
                                fmID: cells.fmID,
                                autoHeight: true,
                                border: false
                            }));
                        }
                        else {
                            panel[cells.mmSeq] = new Ext.Panel({
                                title: cells.lbName,
                                autoHeight: true,
                                border: false,
                                tbar: new Ext.Toolbar({
                                    id: 'tb-menu'
                                })
                            });
                            tab.add(panel[cells.mmSeq]);
                        }
                    }
                    else {
                        if (panel[cells.pseq] != undefined) {
                            panel[cells.pseq].getTopToolbar().add(new Ext.Button({
                                ctCls: 'btn-menu',
                                text: cells.lbName,
                                fmID: cells.fmID,
                                toggleGroup: 'toggle-menu',
                                parentPanel: panel[cells.pseq],
                                enableToggle: true,
                                toggleHandler: function (btn, pressed) {
                                    if (pressed) {
                                        btn.parentPanel.removeAll();
                                        btn.parentPanel.add(new Senate.MainForm({
                                            fmID: btn.fmID,
                                            parentPage: btn.parentPanel,
                                            mainBody: body
                                        }));
                                        btn.parentPanel.doLayout();
                                    }
                                    else {
                                        btn.parentPanel.removeAll();
                                        btn.parentPanel.doLayout();
                                    }
                                }
                            }));
                        }
                    }
                }
                tab.setActiveTab(currentTab);

                body.hideLoading();
            }
        });
        Senate.PageTab.superclass.initComponent.call(this);
    }
});

Senate.FormTab = Ext.extend(Ext.TabPanel, {
	id: 'form-tab',	
	border: false,
    frame: true,
    activeTab: 0,
    
    initComponent: function() {
		var mmID = this.mmID;		
		var fmID = this.fmID;
		var body = this.mainBody;
		
		var panel = new Ext.Panel({
			title: this.tabTitle,
			frame: true,
			autoHeight: true
		});
		panel.add(new Senate.MainForm({
    		fmID: fmID,
    		mmID: mmID,
    		mainBody: body
    	}));
		this.items = [panel];
    	
    	Senate.FormTab.superclass.initComponent.call(this);
    }
});
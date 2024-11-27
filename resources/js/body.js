Senate.BodyPanel = function() {
	Senate.BodyPanel.superclass.constructor.call(this, {		
		id: 'body-panel',
		ctCls: 'body-panel',
		region: 'center',
		margins: '0 5 0 0',
		padding: 5,
		//autoScroll: true,
		bodyStyle: 'overflow-y: scroll'
	});
}

Ext.extend(Senate.BodyPanel, Ext.Panel, {
    initComponent: function () {
        var fmID = getParameter('fmID');
        if (fmID) {
            this.titleBox = new Ext.BoxComponent({
                autoEl: {
                    id: 'title',
                    tag: 'h2',
                    html: getParameter('title')
                }
            });
            this.tbar = [this.titleBox, '->'];

            var json = {
                fmID: fmID,
                parentPage: this,
                mainBody: this
            };
            var mode = getParameter('mode');
            if (mode && mode.trim().length > 0) {
                json.formMode = mode;
                if (mode == 'viewFrm') {
                    json.viewMode = true;
                }
            }
            var pID = getParameter('pid');
            if (pID && pID.trim().length > 0 && (mode == 'viewFrm' || mode == 'editFrm')) {
                json.pID = parseInt(pID);
            }
            this.items = new Senate.MainForm(json);
        }
        else { 
            this.titleBox = new Ext.BoxComponent({
                autoEl: {
                    id: 'title',
                    tag: 'h2',
                    html: 'Welcome'
                }
            });
            this.tbar = [this.titleBox, '->'];
/*
            var eventStore = new Ext.data.JsonStore({
                id: 'eventStore',
                root: 'data',
                proxy: new Ext.data.MemoryProxy(),
                fields: Ext.calendar.EventRecord.prototype.fields.getRange()
            });

			//openInbox();
            var myCalendar = new Ext.calendar.CalendarPanel({
                eventStore: eventStore,
			
                activeItem: 2, // month view
                region: 'center',
                height: 480,

                monthViewCfg: {
                    showHeader: true,
                    showWeekLinks: true,
                    showWeekNumbers: true
                },

                showNavBar: false,
                showTodayText: false,
                showTime: false,
                title: 'My Calendar',

                initComponent: function () {
                    this.constructor.prototype.initComponent.apply(this, arguments);
                },

                showLoading: function () {
                    this.mask = new Ext.LoadMask(myCalendar.el, { msg: 'Please wait...' });
                    this.mask.show();
                },

                hideLoading: function () {
                    this.mask.hide();
                },

                listeners: {
                    'eventclick': {
                        fn: function (vw, rec, el) {
                            var json = rec.json;

                            var title = json.title;
                            var h = screen.height - 300;
                            var w = screen.width - 300;
                            var left = (screen.width / 2) - (w / 2);
                            var top = (screen.height / 2) - (h / 2);
                            window.open("Default.aspx?fmID=" + json.fmID + "&title=" + title + '&mode=viewFrm&pid=' + json.docID, "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=" + w + ", height=" + h + ",top=" + top + ",left=" + left);
                        },
                        scope: this
                    },
                    'viewchange': {
                        fn: function (p, vw, dateInfo) {
                            if (dateInfo) {
                                var startDt = dateInfo.viewStart;
                                var endDt = dateInfo.viewEnd;
                                var p = myCalendar;

                                if (startDt.clearTime().getTime() == endDt.clearTime().getTime()) {
                                    p.setTitle(startDt.format('F j, Y'));
                                }
                                else if (startDt.getFullYear() == endDt.getFullYear()) {
                                    if (startDt.getMonth() == endDt.getMonth()) {
                                        p.setTitle(startDt.format('F j') + ' - ' + endDt.format('j, Y'));
                                    }
                                    else {
                                        p.setTitle(startDt.format('F j') + ' - ' + endDt.format('F j, Y'));
                                    }
                                }
                                else {
                                    p.setTitle(startDt.format('F j, Y') + ' - ' + endDt.format('F j, Y'));
                                }

                                p.setTitle('<div style="text-align: center;">' + p.title + '</div>');
                            }
                        },
                        scope: this
                    }
                }
            });
			

			this.setPageTitle("Wellcome");
			this.removeAll();
			this.add(new Senate.PageTab({
				mmID: 100401,
				mainBody: this
			}));	
/
            this.items = new Ext.Panel({
                border: false,
                items: new Senate.PageTab()
            }); */


            function beginCount() {
                Ext.Ajax.request({
                    url: Senate.url.Core,
                    method: 'POST',
                    params: { act: 'count_unread' },
                    success: function (result) {
                        var json = Ext.util.JSON.decode(result.responseText);
                        var count = json.data;
						
						var inboxMenu = null;
						var wMenu = null;
						try{
							wMenu = Ext.getCmp('menu-tab').items.items[0].items.items[0].nodeHash;
							if(wMenu){
								inboxMenu = wMenu["node-100201"];
							}
						}catch{
							wMenu = null;
							count = 0;
						}
						
                        var msg = document.getElementById('unread-msg');
                        var sep = document.getElementById('unread-sep');
                        if (count > 0) {
                            msg.innerHTML = count + ' unread messages';
                            msg.style.display = 'inline';
                            sep.style.display = 'inline';
                        }
                        else {
                            msg.style.display = 'none';
                            sep.style.display = 'none';
                        }
						try{
							var actFm = Ext.getCmp('main-form');
							var pgTab = Ext.getCmp('page-tab');

							if(pgTab && pgTab.mmID == 100201){
								if(count != 0){
									if(inboxMenu) inboxMenu.setText('Inbox (' + count + ' Unread)');
									pgTab.mainBody.setPageTitle('Inbox (' + count + ' Unread)');
								}else{
									if(inboxMenu) inboxMenu.setText('Inbox');
									pgTab.mainBody.setPageTitle('Inbox');
								}
							}
						}catch{;}
						if (Senate.firstLogin == 0)  {
								Senate.firstLogin = 2;
								openCalendar();
						}
                    }
                });

                setTimeout(beginCount,  Senate.firstLogin == 0 ? 1000 : 3000); //10000
            }
            beginCount();
        }

        Senate.BodyPanel.superclass.initComponent.call(this);
    },

    setPageTitle: function (title) {
        this.titleBox.update(title);
        this.pageTitle = title;
    },

    showLoading: function () {
        var body;

        if (getParameter('fmID')) {
            body = document.body;
        }
        else {
            body = document.getElementById('body-panel');
        }

        var winActive = Ext.WindowMgr.getActive();
        if (winActive) {
            body = document.getElementById(winActive.id);
        }

        this.mask = new Ext.LoadMask(body, { msg: "Please wait..." });
        this.mask.show();
    },

    hideLoading: function () {
        this.mask.hide();
    }
});

Senate.WindowPanel = function() {
	Senate.WindowPanel.superclass.constructor.call(this, {		
		id: 'win-panel',
		region: 'center',
		margins: '0 5 0 0',
		padding: 5,
		autoScroll: true
	});
}

Ext.extend(Senate.WindowPanel, Ext.Panel, {	
	initComponent: function() {
		Senate.WindowPanel.superclass.initComponent.call(this); 	
	}
});
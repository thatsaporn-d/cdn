Senate.MenuPanel = function() {
	Senate.MenuPanel.superclass.constructor.call(this, {
	    id: 'menu-tab',
    	region: 'west',
	    split: true,
	    header: false,
	    width: 200,
	    minSize: 100,
	    maxSize: 250,
	    collapsible: true,
	    collapseMode: 'mini',
	    margins: '0 0 0 5',
		autoScroll: true,
	    animCollapse: false
	});
}
Ext.extend(Senate.MenuPanel, Ext.Panel, {
    showLoading: function () {
        if (!this.isExpand) {
            this.mask = new Ext.LoadMask(document.getElementById('menu-tab'), { msg: "Please wait..." });
            this.mask.show();
            this.isExpand = false;
        }
    },

    initComponent: function () {
        var menu = this;

        this.on('afterlayout', this.showLoading, this);
        this.on('resize', function () {
            menu.mask.hide();
			this.isExpand = true;
        }, this);
        this.on('collapse', function () {
            menu.mask.hide();
            this.isExpand = true;
        }, this);
        this.on('expand', function () {
            menu.mask.hide();
            this.isExpand = true;
        }, this);

        Senate.MenuPanel.superclass.initComponent.call(this);
    },

    loadMenu: function (mainBody) {
        var tabPanel = new Ext.TabPanel({
            border: false
        });
        this.add(tabPanel);

        var menu = this;

        Ext.Ajax.request({
            url: 'json/Menu.aspx',
            method: 'GET',
            success: function (result) {
                var json = Ext.util.JSON.decode(result.responseText);
                var data = json.data;

                var tree = new Array();
                var node = new Array();
                var index = 1;
                for (var i = 0; i < data.length; i++) {
                    var cells = data[i];
                    if (cells.mmLev == 0) {
                        tree[cells.mmID] = new Senate.MenuTree({
                            id: 'tree-' + index,
                            title: cells.lbName,
                            root: new Ext.tree.AsyncTreeNode({
                                expanded: true
                            })
                        });
                        tabPanel.add(tree[cells.mmID]);

                        index++;
                    }
                    else if (cells.mmLev == 1) {
                        node[cells.mmID] = [];
                        node[cells.mmID].push({
                            "ref": cells.pmmID,
                            "text": cells.lbName,
                            "cls": 'menu-node',
                            "singleClickExpand": true,
                            children: []
                        });
                    }
                    else if (cells.mmLev == 2) {
                        ((node[cells.pmmID][0]).children).push({
                            "id": 'node-' + cells.mmID,
                            "text": cells.lbName,
                            "cls": 'menu-leaf',
                            "leaf": true
                        });
                    }
                }
                for (var i = 0; i < node.length; i++) {
                    if (node[i] != undefined) {
                        tree[node[i][0].ref].getRootNode().appendChild(node[i][0]);
                    }
                }

                for (var i = 0; i < tree.length; i++) {
                    if (tree[i] != undefined) {
                        tree[i].on('click', function (node, e) {
                            node.ownerTree.selectPage(node, e);
                        });
                    }
                }

                tabPanel.setActiveTab(0);

                if (menu.mask != undefined) {
                    menu.mask.hide();
                }
            }
        });
    }
});

Senate.MenuTree = Ext.extend(Ext.tree.TreePanel, {
    cls: 'menu-tree',
    autoHeight: true,
    rootVisible: false,
    border: false,

    loader: new Ext.tree.TreeLoader({
        preloadChildren: true,
        clearOnLoad: false
    }),

    listeners: {
        'beforeclick': function (n, e) {
            /*var menu = this;
            var panel = Ext.getCmp('main-form');
            if (n.leaf && panel && (get_formMode() == 2 || get_formMode() == 1)) {
            Ext.MessageBox.confirm('Confirm', 'Are you sure you want to leave this page?', function (btn) {
            if (btn == 'yes')
            menu.selectPage(n, e);
            n.select();
            });
            return false;
            }*/
        },
        'expandnode': function (n) {
            var inbox = n.findChild('id', 'node-' + Senate.inbox);
            if (inbox) {
                Ext.Ajax.request({
                    url: Senate.url.Core,
                    method: 'POST',
                    params: { act: 'count_unread' },
                    success: function (result) {
                        var json = Ext.util.JSON.decode(result.responseText);
                        var count = json.data;

                        var tmp = inbox.text;
                        if (!inbox.label) {
                            inbox.label = tmp
                        }
                        inbox.setText(inbox.label + (count > 0 ? ' (' + count + ' Unread)' : ''));
                    }
                });
            }
        }
    },

    selectPage: function (node, e) {
        var panel = Ext.getCmp('main-form');
		if (typeof Senate.ITEM_CLOUD_ID === "function") {
			if (node.leaf && panel && (get_formMode() == 2 || get_formMode() == 1) && !Ext.isIE) {
				Ext.MessageBox.confirm('Confirm', 'Are you sure you want to leave this page?', function (btn) {
					if (btn == 'yes') {
						Senate.SelectPage(node, e);
					}
				});
			}
			else {
				Senate.SelectPage(node, e);
			}
		}
	},

    initComponent: function () {
        Senate.MenuTree.superclass.initComponent.call(this);
    }
});

Senate.SelectPage = function (node, e) {
    var mainBody = Ext.getCmp('body-panel');

    if (node.isLeaf()) {
        e.stopEvent();

        var keys = node.id.split('-');

        /*if (keys[1] == Senate.inbox) {
            mainBody.setPageTitle(node.text);
            mainBody.removeAll();
            mainBody.add(new Senate.InboxTab({
                mainBody: mainBody,
                act: 'load-inbox',
                tabTitle: 'Inbox'
            }));
            mainBody.doLayout();
        }
        else */
		if (keys[1] == Senate.outbox) {
            mainBody.setPageTitle(node.text);
            mainBody.removeAll();
            mainBody.add(new Senate.InboxTab({
                mainBody: mainBody,
                act: 'load-outbox',
                tabTitle: 'Outbox'
            }));
            mainBody.doLayout();
        }
        else if (keys[1] == Senate.operate) {
            mainBody.setPageTitle(node.text);
            mainBody.removeAll();
            mainBody.add(new Senate.InboxTab({
                mainBody: mainBody,
                act: 'load-process',
                tabTitle: 'Process',
                isProcess: true
            }));
            mainBody.doLayout();
        }
        else if (keys[1] == Senate.docFlow) {
            mainBody.setPageTitle(node.text);
            mainBody.removeAll();
            mainBody.add(new Senate.DocFlowTab({
                mmID: keys[1],
                mainBody: mainBody
            }));
            mainBody.doLayout();
        }
        /*else if (keys[1] == Senate.qn) {
        mainBody.setPageTitle(node.text);
        mainBody.removeAll();
        mainBody.add(new Senate.QNTab({
        mainBody: mainBody
        }));
        mainBody.doLayout();
        }*/
        else {
            mainBody.setPageTitle(node.text);
            mainBody.removeAll();
            mainBody.add(new Senate.PageTab({
                mmID: keys[1],
                mainBody: mainBody
            }));
            mainBody.doLayout();
        }
    }
}
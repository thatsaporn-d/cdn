function showDF(dfType) {
//	var url = 'flow/index.jsp?uid=' + Senate.user.userId + '&dfType=' + dfType;
//	var width = screen.width;
//	var height = screen.height;
//	var left = 0;
//	var top = 0; 
//	
//	var property = 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left + ',scrollbars=yes';
//	window.open(url, 'Document Flow', property);

	var w = new Senate.IFrame({
        maximized: true,
		src: 'flow/Default.aspx?uid=' + Senate.user.userId + '&dfType=' + dfType
	});
	w.show();
}

Senate.IFrame = Ext.extend(Ext.Window, {
	onRender: function() {
	    this.bodyCfg = {
	        tag: 'iframe',
	        src: this.src,
	        cls: this.bodyCls,
	        style: {
	            border: '0px none'
	        }
	    };
	    Senate.IFrame.superclass.onRender.apply(this, arguments);
	}
});

Senate.DocFlowTab = Ext.extend(Ext.TabPanel, {
	id: 'docflow-tab',	
	border: false,
    frame: true,
    activeTab: 0,
    
    initComponent: function() {
    	var mainBody = this.mainBody;
    	
    	var tbar = mainBody.getTopToolbar();
		for (var i = tbar.items.length - 1; i > 1; i--) {
			tbar.remove(i);
		}
		tbar.add('->');
		tbar.add(new Ext.Button({
			text: 'New Document Flow',
			handler: function() {
				showDF(-1);
			}
		}));
    	
    	var inboxDS = new Ext.data.Store({
			autoLoad: true,
			proxy: new Ext.data.HttpProxy({
				method: 'GET',
				url: 'json/Flow.aspx'					
			}),
			reader: new Ext.data.ArrayReader({
				root: 'data',
				totalProperty: 'total'
			}, [
				{ name: 'DFType' },
				{ name: 'DFCode' },
				{ name: 'DocTypeName' },
				{ name: 'DFName' },
				{ name: 'DFDesc' }
			])
		});
    	
		this.items = [new Ext.Panel({
			title: 'Inbox',
			frame: true,
			autoHeight: true,
			items: new Ext.Panel({
				layout: 'column',
				border: false,
				defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
				
				items: new Ext.Panel({    	
					columnWidth: 1,	
					layout: 'fit',
					border: false,
					
					items: new Ext.grid.GridPanel({
						autoHeight: true,
						store: inboxDS,
						colModel: new Ext.grid.ColumnModel([
							new Ext.grid.Column({ 
								header: 'DFType', 
								dataIndex: 'DFType',
								hidden: true
							}),
							new Ext.grid.Column({ 
								header: 'DFCode', 
								dataIndex: 'DFCode',
								width: 10
							}),
							new Ext.grid.Column({ 
								header: 'DocTypeName', 
								dataIndex: 'DocTypeName',
								width: 20
							}),
							new Ext.grid.Column({ 
								header: 'DFName', 
								dataIndex: 'DFName',
								width: 30
							}), 
							new Ext.grid.Column({ 
								header: 'DFDesc', 
								dataIndex: 'DFDesc',
								width: 40
							}),
							new Ext.grid.ActionColumn({
				                align: 'center',
				                width: 5,
				                items: [{
				                    icon: 'resources/css/images/icons/page_go.png',
				                    tooltip: 'Go',
				                    handler: function(grid, rowIndex, colIndex) {
				                    	var rec = grid.getStore().getAt(rowIndex);
										var dfType = rec.get('DFType');
										showDF(dfType);
				                    }
				                }]
				            })
						]),
						viewConfig: { forceFit: true },
						bbar: new Ext.PagingToolbar({
							store: inboxDS,
				            pageSize: 20,
				            displayInfo: true,
				            displayMsg: 'Displaying results {0} - {1} of {2}',
				            emptyMsg: "No results to display"
				        })
					})
				})
			})
		})];
    	
    	Senate.DocFlowTab.superclass.initComponent.call(this);
    }
});
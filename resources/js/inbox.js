 function markRead(val) {
    if (val == 0) {
        return '<span style="color: #e412e3">Unread</span>';
    } 
    else {
        return '<span style="color: #229459">Read</span>';
    }
    return val;
}

Senate.InboxTab = Ext.extend(Ext.TabPanel, {
    id: 'inbox-tab',
    border: false,
    frame: true,
    activeTab: 0,

    act: '',
    tabTitlte: '',

    initComponent: function () {
        var inbox = this;
        var mainBody = this.mainBody;

        var tbar = mainBody.getTopToolbar();
        for (var i = tbar.items.length - 1; i > 1; i--) {
            tbar.remove(i);
        }

        var act = this.act;
        var title = this.tabTitle;

        var grid = null;
        if (!this.isProcess) {
            var inboxDS = new Ext.data.Store({
                autoLoad: true,
                baseParams: { act: act },
                proxy: new Ext.data.HttpProxy({
                    method: 'GET',
                    url: 'json/Inbox.aspx'
                }),
                reader: new Ext.data.JsonReader({
                    root: 'data',
                    totalProperty: 'total'
                }, [
					{ name: 'TRANID' },
					{ name: 'DOCDATE' },
					{ name: 'STATUSNAME' },
					{ name: 'DOCTYPENAME' },
					{ name: 'DOCNONAME' },
					{ name: 'STATUSID' },
					{ name: 'FMID' },
					{ name: 'REFDOCID' },
					{ name: 'DFDOCID' },
					{ name: 'DOCTYPE' },
					{ name: 'ISEDITABLE' },
					{ name: 'SUBMITNAME' },
					{ name: 'DFDOCNO' }
				])
            });
            grid = new Ext.grid.GridPanel({
                autoHeight: true,
                store: inboxDS,
                colModel: new Ext.grid.ColumnModel([
                    new Ext.grid.ActionColumn({
                        align: 'center',
                        width: 5,
                        items: [{
                            icon: 'resources/css/images/icons/page_go.png',
                            tooltip: 'Go',
                            handler: function (grid, rowIndex, colIndex) {
                                var rec = grid.getStore().getAt(rowIndex);

                                var doc = {};
                                doc['RefDocID'] = rec.get('REFDOCID');
                                doc['FMID'] = rec.get('FMID');
                                doc['DocNo'] = rec.get('TRANID');
                                doc['DocTitle'] = rec.get('DOCTYPENAME');
                                doc['ProcessName'] = rec.get('STATUSNAME');
                                doc['RecvDate'] = rec.get('DOCDATE');
                                doc['DocType'] = rec.get('DOCTYPE');
                                doc['IsEditable'] = rec.get('ISEDITABLE');

                                mainBody.removeAll();
                                mainBody.add(new Senate.VerifyPanel({
                                    tranID: rec.get('TRANID'),
                                    docID: rec.get('DFDOCID'),
                                    docType: rec.get('DOCTYPE'),
                                    refDoc: doc,
                                    mainBody: mainBody,
                                    isEditable: doc['IsEditable'],
                                    showVerify: (act == 'load-inbox') ? true : false
                                }));
                                mainBody.doLayout();
                            }
                        }]
                    }),
					new Ext.grid.Column({
					    header: 'TRANID',
					    dataIndex: 'TRANID',
					    hidden: true
					}),
					new Ext.grid.Column({
					    header: 'Receive Date',
					    dataIndex: 'DOCDATE',
					    width: 15,
                        renderer: dateColumn,
					    align: 'center'
					}),
					new Ext.grid.Column({
					    header: 'Process',
					    dataIndex: 'STATUSNAME',
					    width: 15
					}),
					new Ext.grid.Column({
					    header: 'Document Type',
					    dataIndex: 'DOCTYPENAME',
					    width: 25
					}),
					new Ext.grid.Column({
					    header: 'Document No',
					    dataIndex: 'DOCNONAME',
					    width: 25
					}),
					new Ext.grid.Column({
					    header: 'Status',
					    dataIndex: 'STATUSID',
					    width: 10,
					    align: 'center',
					    renderer: markRead
					}),
					new Ext.grid.Column({
					    header: 'FMID',
					    dataIndex: 'FMID',
					    width: 5,
					    hidden: true
					}),
					new Ext.grid.Column({
					    header: 'RefDocID',
					    dataIndex: 'REFDOCID',
					    width: 5,
					    hidden: true
					}),
					new Ext.grid.Column({
					    header: 'DFDocID',
					    dataIndex: 'DFDOCID',
					    width: 5,
					    hidden: true
					}),
					new Ext.grid.Column({
					    header: 'DocType',
					    dataIndex: 'DOCTYPE',
					    width: 5,
					    hidden: true
					}),
					new Ext.grid.Column({
					    header: 'IsEditable',
					    dataIndex: 'ISEDITABLE',
					    width: 5,
					    hidden: true
					}),
					new Ext.grid.Column({
					    header: 'Submit By',
					    dataIndex: 'SUBMITNAME',
					    width: 15
					}),
					new Ext.grid.Column({
					    header: 'DF NO',
					    dataIndex: 'DFDOCNO',
					    width: 15
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
            });
        }
        else {
            // Document Process
            grid = new Ext.grid.GridPanel({
                autoHeight: true,
                store: new Ext.data.Store({
                    autoLoad: true,
                    baseParams: { act: act },
                    proxy: new Ext.data.HttpProxy({
                        method: 'GET',
                        url: 'json/Inbox.aspx'
                    }),
                    reader: new Ext.data.ArrayReader({
                        root: 'data',
                        totalProperty: 'total'
                    }, [
						{ name: 'DFDocID' },
						{ name: 'DocID' },
						{ name: 'DocTypeName' },
						{ name: 'DocNo' },
						{ name: 'DFDocNo' },
						{ name: 'DocType' },
						{ name: 'FMID' },
						{ name: 'DFDocStatus' },
						{ name: 'CompleteDate' },
						{ name: 'CreateDate' }
					])
                }),
                colModel: new Ext.grid.ColumnModel([
                //DFDocID, DocID, DocNo, DocType, FMID, DFDocStatus, CompleteDate
				new Ext.grid.ActionColumn({
					    align: 'center',
					    width: 5,
					    items: [{
					        icon: 'resources/css/images/icons/page_go.png',
					        tooltip: 'Go',
					        handler: function (grid, rowIndex, colIndex) {
					            var rec = grid.getStore().getAt(rowIndex);

					            var doc = {};
					            doc['RefDocID'] = rec.get('DocID');
					            doc['FMID'] = rec.get('FMID');
					            doc['DocNo'] = rec.get('DocNo');
					            doc['DocTitle'] = 'Document'; //rec.get('DocName');
					            doc['ProcessName'] = rec.get('DFDocStatus');
					            doc['RecvDate'] = rec.get('CompleteDate');
					            doc['DocType'] = rec.get('DocType');
					            doc['IsEditable'] = 0;

					            mainBody.removeAll();
					            mainBody.add(new Senate.VerifyPanel({
					                tranID: rec.get('TransID'),
					                docID: rec.get('DFDocID'),
					                docType: rec.get('DocType'),
					                refDoc: doc,
					                mainBody: mainBody,
					                isEditable: doc['IsEditable'],
					                showVerify: true,
					                isProcess: true
					            }));
					            mainBody.doLayout();
					        }
					    }]
					}),
					{header: 'DFDocID', dataIndex: 'DFDocID', hidden: true },
					{ header: 'DocID', dataIndex: 'DocID', hidden: true },
					{ header: 'Document Type', dataIndex: 'DocTypeName', width: 20 },
					{ header: 'Document No', dataIndex: 'DocNo', width: 20 },
					{ header: 'DFDocNo', dataIndex: 'DFDocNo', hidden: true },
					{ header: 'DocType', dataIndex: 'DocType', hidden: true },
					{ header: 'FMID', dataIndex: 'FMID', hidden: true },
					{ header: 'DF Status', dataIndex: 'DFDocStatus', width: 50 },
					{ header: 'Complete Date', dataIndex: 'CompleteDate', width: 20 },
					{ header: 'Submit Date', dataIndex: 'CreateDate', width: 20 }
					
				]),
                viewConfig: { forceFit: true }
            });
        }

        this.items = [new Ext.Panel({
            title: title,
            frame: true,
            autoHeight: true,
            items: [
				new Ext.Panel({
				    layout: 'column',
				    border: false,
				    defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },

				    items: new Ext.Panel({
				        columnWidth: 1,
				        layout: 'fit',
				        border: false,

				        items: grid
				    })
				})
			]
        })];

        if (this.isProcess) {
            this.items[0].items.insert(0, new Ext.Panel({
                title: 'Filter',
                style: 'margin-bottom: 5px',
                frame: true,
                collapsible: true,
                animCollapse: false,

                layout: 'column',
                border: false,
                defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },

                items: [
                    new Ext.FormPanel({
                            columnWidth: .5,
                            layout: 'form',
                            border: false,
                            html: '<img src="resources/css/images/pixel.gif" />',

                            items: [
					            new Ext.form.ComboBox({
					                id: 'cmb-process',
					                fieldLabel: 'Process',
					                hiddenName: 'proc',
					                anchor: '100%',
					                mode: 'local',
					                typeAhead: true,
					                triggerAction: 'all',
					                store: new Ext.data.ArrayStore({
					                    fields: [
								            'itemId',
								            'itemName'
							            ],
					                    data: [[-1, 'All'], [0, 'In Process'], [1, 'Complete']]
					                }),
					                valueField: 'itemId',
					                displayField: 'itemName',
					                value: -1
					            }),
                                new Ext.form.ComboBox({
                                    id: 'dtype',
                                    hiddenName: 'dtype',
                                    fieldLabel: 'Document Type',
                                    anchor: '100%',

                                    typeAhead: true,
                                    triggerAction: 'all',
                                    store: new Ext.data.Store({
                                        baseParams: { tbID: 64 },
                                        autoLoad: true,
                                        proxy: new Ext.data.HttpProxy({
                                            method: 'GET',
                                            url: Senate.url.Combo,
                                            success: function (result) {
                                                var json = Ext.util.JSON.decode(result.responseText);
                                                if (!json.success) {
                                                    showError(json.errMessage, 'ComboBox');
                                                }
                                            }
                                        }),
                                        reader: new Ext.data.ArrayReader({
                                            root: 'data'
                                        }, [
								            { name: 'id' },
								            { name: 'name' }
							            ])
                                    }),
                                    mode: 'local',
                                    valueField: 'id',
                                    displayField: 'name'
                                })
                        ]
                    })
                ]
            }));

            tbar.add(new Ext.Button({
                text: 'Search',
                handler: function () {
                    var proc = Ext.getCmp('cmb-process').getValue();
                    grid.getStore().setBaseParam('proc', proc);

                    var dtype = Ext.getCmp('dtype').getValue();
                    grid.getStore().setBaseParam('dtype', dtype);

                    grid.getStore().load();

                    //					
                    //					form.getForm().submit({
                    //				    	url: 'json/Inbox.aspx',
                    //				    	method: 'GET',			
                    //				    	params: { act: 'load-process', proc: proc },
                    //				    	success: function(form, result) {
                    //				    		var data = result.result.data;				    		
                    //				    		grid.getStore().loadData([]);
                    //				    	},
                    //				    	failure: function(form, result) {
                    //				    		show_error('Load process list failed');
                    //				    	}
                    //				    });
                }
            }));
        }
        else {
            this.items[0].items.insert(0, new Ext.Panel({
                title: 'Filter',
                style: 'margin-bottom: 5px',
                frame: true,
                collapsible: true,
                animCollapse: false,

                layout: 'column',
                border: false,
                defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },

                items: [
					new Ext.FormPanel({
					    columnWidth: .5,
					    layout: 'form',
					    border: false,
					    html: '<img src="resources/css/images/pixel.gif" />',

					    items: [
                            new Ext.form.TextField({
                                id: 'docno',
                                name: 'docno',
                                fieldLabel: 'Document No',
                                anchor: '100%'
                            }),
                            new Ext.form.ComboBox({
                                id: 'dtype',
                                hiddenName: 'dtype',
                                fieldLabel: 'Document Type',
                                anchor: '100%',

                                typeAhead: true,
                                triggerAction: 'all',
                                store: new Ext.data.Store({
                                    comboId: id,
                                    baseParams: { tbID: 64 },
                                    autoLoad: true,
                                    proxy: new Ext.data.HttpProxy({
                                        method: 'GET',
                                        url: Senate.url.Combo,
                                        success: function (result) {
                                            var json = Ext.util.JSON.decode(result.responseText);
                                            if (!json.success) {
                                                showError(json.errMessage, 'ComboBox');
                                            }
                                        }
                                    }),
                                    reader: new Ext.data.ArrayReader({
                                        root: 'data'
                                    }, [
										{ name: 'id' },
										{ name: 'name' }
									])
                                }),
                                mode: 'local',
                                valueField: 'id',
                                displayField: 'name'
                            }),
							new Ext.form.DateField({
							    id: 'start-recv',
							    name: 'srecv',
							    fieldLabel: 'Start Receive',
							    anchor: '100%'
							})
						]
					}),
					new Ext.FormPanel({
					    columnWidth: .5,
					    layout: 'form',
					    border: false,
					    html: '<img src="resources/css/images/pixel.gif" />',

					    items: [
                            new Ext.form.TextField({
                                id: 'dfno',
                                name: 'dfno',
                                fieldLabel: 'DF No',
                                anchor: '100%'
                            }),
                            new Ext.form.ComboBox({
                                id: 'submit',
                                hiddenName: 'submit',
                                fieldLabel: 'Submit By',
                                anchor: '100%',

                                typeAhead: true,
                                triggerAction: 'all',
                                store: new Ext.data.Store({
                                    comboId: id,
                                    baseParams: { tbID: 608 },
                                    autoLoad: true,
                                    proxy: new Ext.data.HttpProxy({
                                        method: 'GET',
                                        url: Senate.url.Combo,
                                        success: function (result) {
                                            var json = Ext.util.JSON.decode(result.responseText);
                                            if (!json.success) {
                                                showError(json.errMessage, 'ComboBox');
                                            }
                                        }
                                    }),
                                    reader: new Ext.data.ArrayReader({
                                        root: 'data'
                                    }, [
										{ name: 'id' },
										{ name: 'name' }
									])
                                }),
                                mode: 'local',
                                valueField: 'id',
                                displayField: 'name'
                            })/*,
							new Ext.form.DateField({
							    id: 'end-recv',
							    name: 'erecv',
							    fieldLabel: 'End Receive',
							    anchor: '100%'
							})*/
						]
					})
				]
            }));

            tbar.add(new Ext.Button({
                text: 'Filter',
                handler: function () {
                    var docno = Ext.getCmp('docno').getValue();
                    grid.getStore().setBaseParam('docno', docno);

                    var dfno = Ext.getCmp('dfno').getValue();
                    grid.getStore().setBaseParam('dfno', dfno);

                    var dtype = Ext.getCmp('dtype').getValue();
                    grid.getStore().setBaseParam('dtype', dtype);

                    var submit = Ext.getCmp('submit').getValue();
                    grid.getStore().setBaseParam('submit', submit);

                    var srecv = Ext.getCmp('start-recv').getValue();
                    grid.getStore().setBaseParam('srecv', srecv);

//                    var erecv = Ext.getCmp('end-recv').getValue();
//                    grid.getStore().setBaseParam('erecv', erecv);

                    grid.getStore().load();
                }
            }));

            /*tbar.add(new Ext.Button({
                text: 'Clear',
                handler: function () {
                    Ext.getCmp('filter-inbox-panel').getForm().reset();

                    grid.getStore().load();
                }
            }));*/
        }

        Senate.InboxTab.superclass.initComponent.call(this);
    }
});

Senate.VerifyPanel = Ext.extend(Ext.Panel, {
    id: 'inbox-tab',
    border: false,

    initComponent: function () {
        var mainBody = this.mainBody;
        var doc = this.refDoc;
        var tranID = this.tranID;
        var docID = this.docID;
        var docType = this.docType;
        var showVerify = this.showVerify;
        var isEditable = this.isEditable;
        var isPass_DefaultValue = 0;
        var isProcess = this.isProcess;

        if (!isEditable)
            isPass_DefaultValue = -1;

        this.temp = {
            tranID: tranID,
            docID: docID,
            docType: docType,
            refDoc: doc,
            mainBody: mainBody,
            isEditable: isEditable,
            showVerify: showVerify,
            isProcess: isProcess
        };


        var grid = new Ext.grid.GridPanel({
            autoHeight: true,
            store: new Ext.data.ArrayStore({
                fields: [
					{ name: 'DIsPass' },
					{ name: 'DMemo' },
					{ name: 'PostDate' },
					{ name: 'Name' }
				]
            }),
            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: true
            }),
            colModel: new Ext.grid.ColumnModel([
				{
				    header: 'Status',
				    dataIndex: 'DIsPass',
				    width: 10,
				    renderer: verifyColumn
				}, {
				    header: 'Remark',
				    dataIndex: 'DMemo',
				    width: 50
				}, {
				    header: 'Receive Date',
				    dataIndex: 'PostDate',
				    width: 10
				}, {
				    header: 'Post By',
				    dataIndex: 'Name',
				    width: 30
				}
			]),
            viewConfig: {
                forceFit: true,
                getRowClass: function (record, index) {
                    return 'wrap-cell';
                }
            }
        });

        var colPanel1 = new Ext.Panel({
            columnWidth: .5,
            layout: 'form',
            border: false,
            html: '<img src="resources/css/images/pixel.gif" />',

            items: []
        });
        var colPanel2 = new Ext.Panel({
            columnWidth: .5,
            layout: 'form',
            border: false,
            html: '<img src="resources/css/images/pixel.gif" />',

            items: []
        });

        this.process = new Ext.form.FormPanel({
            title: 'Document',
            style: 'margin-top: 5px',
            frame: true,
            animCollapse: false,
            collapsible: true,
            //			collapsed: true,
            items: [new Ext.form.FieldSet({
                title: 'Document Detail',
                collapsible: false,
                autoHeight: true,
                layout: 'column',
                defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
                items: [new Ext.Panel({
                    columnWidth: 0.5,
                    layout: 'form',
                    border: false,
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Process',
                        value: doc.ProcessName,
                        anchor: '100%'
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: 'Receive Date',
                        value: doc.RecvDate,
                        anchor: '100%'
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: 'Create By',
                        value: Senate.user.firstName,
                        anchor: '100%'
                    }]
                }), new Ext.Panel({
                    columnWidth: 0.5,
                    layout: 'form',
                    border: false,
                    items: [{
                        xtype: 'displayfield',
                        fieldLabel: 'Document No',
                        value: doc.DocTitle,
                        anchor: '100%'
                    }]
                })]
            }), new Ext.form.FieldSet({
                title: 'Verify Form',
                collapsible: false,
                autoHeight: true,
                layout: 'column',
                hidden: !showVerify || (isProcess == true) || (isEditable == 0),
                defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
                items: [new Ext.Panel({
                    columnWidth: 0.5,
                    layout: 'form',
                    border: false,
                    items: [{
                        xtype: 'combo',
                        fieldLabel: '<b style="color: #3B5998">Status</b>',
                        anchor: '100%',
                        allowBlank: false,
                        mode: 'local',
                        disabled: (isEditable == 0),
                        //hiddenName: 'verify',
                        hiddenName: 'V_DISPASS',
                        tfType: Senate.tf.Integer,
                        store: new Ext.data.ArrayStore({
                            fields: [
								'id',
								'name'
							],
                            data: [[1, 'Approve'], [0, 'Reject']]
                        }),
                        typeAhead: true,
                        triggerAction: 'all',
                        valueField: 'id',
                        displayField: 'name',
                        value: isPass_DefaultValue
                    }, new Ext.form.TextArea({
                        //name: 'remark',
                        name: 'V_DMEMO',
                        disabled: (isEditable == 0),
                        tfType: Senate.tf.String,
                        fieldLabel: 'Remark',
                        anchor: '100%'
                    })]
                })]
            }),
			new Ext.form.FieldSet({
			    title: 'Fields',
			    collapsible: false,
			    autoHeight: true,
			    layout: 'column',
			    hidden: !showVerify || (isProcess == true) || (isEditable == 0),
			    defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
			    items: [colPanel1, colPanel2]
			}),
			new Ext.form.FieldSet({
			    title: 'History',
			    collapsible: false,
			    autoHeight: true,
			    layout: 'column',
			    //hidden: !showVerify,
			    defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
			    items: new Ext.Panel({
			        columnWidth: 1,
			        layout: 'fit',
			        border: false,
			        items: grid
			    })
			})],
            buttonAlign: 'center',
            buttons: [
				new Ext.Button({
				    text: 'Save',
				    hidden: !showVerify || (isProcess == true) || (isEditable == 0),
				    handler: function () {
				        if (!submitForm.isValid()) {
				            show_error('Please select status');
				            return;
				        }

				        var values = [tranID, Senate.user.userId];
				        var types = [Senate.tf.Integer, Senate.tf.Integer];
				        var names = ['V_TRANID', 'V_IPOSTBY', 'V_DISPASS', 'V_DMEMO'];

				        for (var i = 0; i < colPanel1.items.length; i++) {
				            names.push(colPanel1.get(i).getName());
				        }
				        for (var i = 0; i < colPanel2.items.length; i++) {
				            names.push(colPanel2.get(i).getName());
				        }

				        for (var i = 2; i < names.length; i++) {
				            var field = submitForm.findField(names[i]);
				            if (field) {
				                types.push(field.tfType);
				                values.push(field.getValue());
				            }
				        }

				        var params = new Array();
				        for (var i = 0; i < values.length; i++) {
				            params.push({
				                name: names[i],
				                type: types[i],
				                value: values[i]
				            });
				        }

				        call_sp({
				            spName: 'up_DF_SaveToLog',
				            params: params
				        }, function (res) {
				            if (res.retCode > -1) {
				                show_info('Your document has been save successful');
				            }
				        });
				    }
				}),
	    		new Ext.Button({
	    		    text: (isEditable == 0) ? 'Submit' : 'Send',
	    		    hidden: !showVerify || (isProcess == true),
	    		    handler: function () {
	    		        if (!submitForm.isValid()) {
	    		            show_error('Please select status');
	    		            return;
	    		        }

	    		        var values = [tranID, Senate.user.userId];
	    		        var types = [Senate.tf.Integer, Senate.tf.Integer];
	    		        var names = ['V_TRANID', 'V_IPOSTBY', 'V_DISPASS', 'V_DMEMO'];

	    		        for (var i = 0; i < colPanel1.items.length; i++) {
	    		            names.push('V_' + colPanel1.get(i).getName());
	    		        }
	    		        for (var i = 0; i < colPanel2.items.length; i++) {
	    		            names.push('V_' + colPanel2.get(i).getName());
	    		        }

	    		        for (var i = 2; i < names.length; i++) {
	    		            var field = submitForm.findField(names[i]);
	    		            if (field) {
	    		                types.push(field.tfType);
	    		                values.push(field.getValue());
	    		            }
	    		        }

	    		        var params = new Array();
	    		        for (var i = 0; i < values.length; i++) {
	    		            params.push({
	    		                name: names[i],
	    		                type: types[i],
	    		                value: values[i]
	    		            });
	    		        }

	    		        call_sp({
	    		            spName: 'up_DF_SaveToLog',
	    		            loading: false,
	    		            params: params
	    		        }, function (res) {
	    		            if (res.retCode > -1) {
	    		                Ext.Ajax.request({
	    		                    url: 'json/Inbox.aspx',
	    		                    method: 'POST',
	    		                    params: { act: 'submit-flow', tranID: tranID, docID: docID, refDocID: doc['RefDocID'], docType: docType },
	    		                    success: function (result) {
	    		                        var json = Ext.util.JSON.decode(result.responseText);
	    		                        if (json.success) {
                                             Ext.Msg.show({
	    		                	    		title: 'Success',
	    		                	    		msg: 'Your document has been sent successful',
	    		                	    		icon: Ext.Msg.INFO,
	    		                	    		buttons: Ext.Msg.OK,
	    		                	    		fn: function () {
	    		                	    		    hide_loading();
	    		                	    		    mainBody.removeAll();
	    		                	    		    mainBody.add(new Senate.InboxTab({
	    		                	    		        mainBody: mainBody,
	    		                	    		        act: 'load-inbox',
	    		                	    		        tabTitle: 'Inbox'
	    		                	    		    }));
	    		                	    		    mainBody.doLayout();
	    		                	    		}
	    		                	    	});
	    		                        }
	    		                        else {
	    		                        	hide_loading();
	    		                        	show_error('Submit failed');
	    		                        }
	    		                    }
	    		                });

	    		                //	    		                submitForm.submit({
	    		                //	    		                    url: 'json/Inbox.aspx',
	    		                //	    		                    method: 'POST',
	    		                //                                    timeout: 3600000,
	    		                //	    		                    params: { act: 'submit-flow', tranID: tranID, docID: docID, refDocID: doc['RefDocID'], docType: docType },
	    		                //	    		                    success: function (form, result) {
	    		                //	    		                        if (result.result.success) {
	    		                //	    		                            Ext.Msg.show({
	    		                //	    		                                title: 'Success',
	    		                //	    		                                msg: 'Your document has been sent successful',
	    		                //	    		                                icon: Ext.Msg.INFO,
	    		                //	    		                                buttons: Ext.Msg.OK,
	    		                //	    		                                fn: function () {
	    		                //	    		                                    hide_loading();
	    		                //	    		                                    mainBody.removeAll();
	    		                //	    		                                    mainBody.add(new Senate.InboxTab({
	    		                //	    		                                        mainBody: mainBody,
	    		                //	    		                                        act: 'load-inbox',
	    		                //	    		                                        tabTitle: 'Inbox'
	    		                //	    		                                    }));
	    		                //	    		                                    mainBody.doLayout();
	    		                //	    		                                }
	    		                //	    		                            });
	    		                //	    		                        }
	    		                //	    		                        else {
	    		                //	    		                            hide_loading();
	    		                //	    		                            show_error('Submit failed');
	    		                //	    		                        }
	    		                //	    		                    },
	    		                //	    		                    failure: function (form, result) {
	    		                //	    		                        hide_loading();
	    		                //	    		                        show_error(result.result.errMessage);
	    		                //	    		                    }
	    		                //	    		                });
	    		            }
	    		        });
	    		    }
	    		})
			]
        });

        if (doc.FMID == Senate.customerQn) {
            this.verify = new Senate.QN({ docID: doc.RefDocID, viewMode: true, mainBody: mainBody });
        }
        else {
            this.verify = new Senate.MainForm({
                title: doc.DocTitle,
                animCollapse: false,
                collapsible: true,
                pID: doc.RefDocID,
                fmID: doc.FMID,
                viewMode: true,
                mainBody: mainBody,
                parentPage: this,
                isInbox: true,
                ignoreCmd: !showVerify,
                formMode: 'process'
            });
        }

        this.items = [this.verify, this.process];

        var submitForm = this.process.getForm();
        Ext.Ajax.request({
            url: 'json/Inbox.aspx',
            method: 'GET',
            params: { act: 'load-form', tranID: tranID, addMark: showVerify, docID: docID },
            success: function (response) {
                var json = Ext.util.JSON.decode(response.responseText);

                if (json.items) {
                    grid.getStore().loadData(json.items);
                }

                if (json.details) {
                    var dets = json.details;
                    var index = 0;
                    for (var i = 0; i < dets.length; i++) {
                        var comp = null;

                        switch (dets[i].type) {
                            case Senate.fd.TextField:
                                {
                                    comp = new Ext.form.TextField({
                                        fieldLabel: dets[i].label,
                                        name: 'V_' + dets[i].field.toUpperCase(),
                                        tfType: Senate.tf.String,
                                        anchor: '100%'
                                    });
                                    break;
                                }
                            case Senate.fd.DateField:
                                {
                                    comp = new Ext.form.DateField({
                                        fieldLabel: dets[i].label,
                                        format: 'd/m/Y',
                                        name: 'V_' + dets[i].field.toUpperCase(),
                                        tfType: Senate.tf.DateTime,
                                        anchor: '100%'
                                    });
                                    break;
                                }
                            case Senate.fd.ComboBox:
                                {
                                    var text = dets[i].text;
                                    text = text.replace(/\s+/g, '');
                                    var arr = text.split(';');

                                    var data = [];
                                    for (var j = 0; j < arr.length; j++) {
                                        if (arr[j]) {
                                            data.push(arr[j].split(':'));
                                        }
                                    }

                                    comp = new Ext.form.ComboBox({
                                        fieldLabel: dets[i].label,
                                        anchor: '100%',
                                        mode: 'local',
                                        typeAhead: true,
                                        triggerAction: 'all',
                                        hiddenName: 'V_' + dets[i].field.toUpperCase(),
                                        tfType: Senate.tf.Integer,
                                        store: new Ext.data.ArrayStore({
                                            fields: [
											'itemId',
											'itemName'
										],
                                            data: data
                                        }),
                                        valueField: 'itemId',
                                        displayField: 'itemName'
                                    });
                                    break;
                                }
                            case Senate.fd.CheckBox:
                                {
                                    comp = new Ext.form.Checkbox({
                                        name: 'V_' + dets[i].field.toUpperCase(),
                                        tfType: Senate.tf.Integer,
                                        fieldLabel: dets[i].label
                                    });
                                    break;
                                }
                        }

                        if (comp != null) {
                            if (index % 2 == 0) {
                                colPanel1.add(comp);
                            }
                            else {
                                colPanel2.add(comp);
                            }
                            index++;
                        }
                    }
                    colPanel1.doLayout();
                    colPanel2.doLayout();
                }

                var data = json.data;
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        var row = data[i];
                        var field = submitForm.findField('V_' + row.field.toUpperCase());
                        var value = row.value;
                        if (field) {
                            if (field.tfType == Senate.tf.DateTime) {
                                var dt = value.substring(0, value.lastIndexOf('.'));
                                field.setValue(Date.parseDate(dt, 'd/m/Y H:i:s'));
                            }
                            else {
                                field.setValue(value);
                            }
                        }
                    }
                }
            }
        });

        Senate.VerifyPanel.superclass.initComponent.call(this);
    }
});

function verifyColumn(val) {
    val = parseInt(val);
    if (val == 0) {
    	return 'Reject';
    } 
    else if(val == 1){
    	return 'Approve';
    }
    else{
        return '';
    }
}
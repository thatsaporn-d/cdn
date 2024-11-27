Senate.QN = Ext.extend(Ext.Panel, {
    //id: 'qn-form',
    //title: 'Questionnaire',
    border: false,
    autoHeight: true,
    frame: true,
    viewMode: false,

    createQuestion: function (qtype, title, manualCreate, qn) {
        if (!title) {
            title = 'None';
        }

        var cmbType = new Ext.form.ComboBox({
            fieldLabel: 'Question Type',
            anchor: '50%',
            mode: 'local',
            typeAhead: true,
            triggerAction: 'all',
            editable: false,
            cls: 'white-field',
            readOnly: qn.viewMode,
            store: new Ext.data.ArrayStore({
                fields: [
					'id',
					'name'
				],
                data: [[1, 'Text'], [2, 'Paragraph text'], [3, 'Multiple choice'], [4, 'Checkboxes'], [6, 'Scale'], [7, 'Grid']/*, [5, 'Choose from a list'], [6, 'Scale'], [7, 'Grid']*/]
            }),
            valueField: 'id',
            displayField: 'name',
            listeners: {
                'select': function (cmb) {
                    var qform = cmb.ownerCt.items.get(2);
                    qform.removeAll();

                    switch (cmb.getValue()) {
                        case 1:
                            {
                                qform.add(new Ext.form.TextField({
                                    readOnly: true,
                                    style: 'background: none; background-color: #F3F3F3',
                                    value: 'Their answer',
                                    width: 150
                                }));
                                break;
                            }
                        case 2:
                            {
                                qform.add(new Ext.form.TextArea({
                                    readOnly: true,
                                    width: 300,
                                    style: 'background: none; background-color: #F3F3F3',
                                    value: 'Their longer answer'
                                }));
                                break;
                            }
                        case 3:
                            {
                                qform.add([
							        qform.createOption(1, 'radio'),
							        new Ext.Button({
							            style: 'margin-top: 5px',
							            text: 'Add Option',
                                        hidden: qn.viewMode,
							            handler: function () {
							                var index = qform.items.length;
							                qform.insert(index - 1, qform.createOption(index, 'radio'));
							                qform.doLayout();
							            }
							        })
							    ]);
                                break;
                            }
                        case 4:
                            {
                                qform.add([
							        qform.createOption(1, 'checkbox'),
                                    { 
                                        border: false,
                                        layout: 'hbox',
                                        style: 'margin-top: 5px',
                                        width: 200,
                                        defaults: {
                                            flex: 1,
                                            margins: '0 5 0 0'
                                        },
                                        items: [
                                            new Ext.Button({
                                                text: 'Add Option',
                                                hidden: qn.viewMode,
                                                handler: function () {
                                                    var index = qform.items.length;
                                                    qform.insert(index - 1, qform.createOption(index, 'checkbox'));
                                                    qform.doLayout();
                                                }
                                            }),
                                            new Ext.form.DisplayField({
                                                width: 20,
                                                style: 'text-align: center',
                                                value: 'or'
                                            }),
                                            new Ext.Button({
                                                text: 'Add Other',
                                                handler: function () {
                                                }
                                            })
                                        ]
                                    }
							    ]);
                                break;
                            }
                        case 5:
                            {
                                qform.add([
							        qform.createOption(1, 'displayfield'),
							        new Ext.Button({
							            style: 'margin-top: 5px',
							            text: 'Add Option',
                                        hidden: qn.viewMode,
							            handler: function () {
							                var index = qform.items.length;
							                qform.insert(index - 1, qform.createOption(index, 'displayfield'));
							                qform.doLayout();
							            }
							        })
							    ]);
                                break;
                            }
                        case 6:
                            {
                                qform.add(qform.createScale(1, 5));
                                break;
                            }
                        case 7:
                            {
                                //qform.add(qform.createGrid());
                                var rowPanel = new Ext.Panel({
                                    items: [
                                        //qform.createGridLabel(1, 'Row', rowPanel),
							            new Ext.Button({
							                style: 'margin-top: 5px',
							                text: 'Add Row',
                                            hidden: qn.viewMode,
							                handler: function () {
							                    var index = rowPanel.items.length;
							                    rowPanel.insert(index - 1, qform.createGridLabel(index, 'Row', rowPanel));
							                    rowPanel.doLayout();
							                }
							            })
                                    ]
                                });
                                rowPanel.insert(0, qform.createGridLabel(1, 'Row', rowPanel));

                                var colPanel = new Ext.Panel({
                                    items: [
                                        //qform.createGridLabel(1, 'Column', colPanel),
							            new Ext.Button({
							                style: 'margin-top: 5px',
							                text: 'Add Column',
                                            hidden: qn.viewMode,
							                handler: function () {
							                    var index = colPanel.items.length;
							                    colPanel.insert(index - 1, qform.createGridLabel(index, 'Column', colPanel));
							                    colPanel.doLayout();
							                }
							            })
                                    ]
                                });
                                colPanel.insert(0, qform.createGridLabel(1, 'Column', colPanel));                                

                                qform.add([
                                    rowPanel, 
                                    new Ext.BoxComponent({
	                                    autoEl: {
                                            html: '<div style="margin: 10px 0; height: 1px; background-color: #ddd;"></div>'
	                                    }
	                                }), 
                                    colPanel
                                ]);


                                /*qform.add([
							        qform.createOption(1, 'checkbox'),
							        new Ext.Button({
							            style: 'margin-top: 5px',
							            text: 'Add Row',
							            handler: function () {
							                var index = qform.items.length;
							                qform.insert(index - 1, qform.createOption(index, 'checkbox'));
							                qform.doLayout();
							            }
							        }),
                                    qform.createOption(1, 'radio'),
							        new Ext.Button({
							            style: 'margin-top: 5px',
							            text: 'Add Column',
							            handler: function () {
							                var index = qform.items.length;
							                qform.insert(index - 1, qform.createOption(index, 'radio'));
							                qform.doLayout();
							            }
							        })
							    ]);*/
                                break;
                            }
                    }

                    qform.doLayout();
                }
            }
        });

        var portlet = new Ext.ux.Portlet({
            collapsible: false,
            title: title,
            draggable: !qn.viewMode,
            tools: [{
                id: 'gear',
                hidden: qn.viewMode,
                handler: function (e, target, panel) {
                    var col = panel.ownerCt;
                    for (var i = 0; i < col.items.length; i++) {
                        var p = col.items.get(i);
                        if (p != panel && !p.collapsed) {
                            p.toggleCollapse(false);
                        }
                    }

                    panel.toggleCollapse(false);
                    panel.doLayout();
                }
            }, {
                id: 'close',
                hidden: qn.viewMode,
                handler: function (e, target, panel) {
                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to discard this question?', function (btn) {
                        if (btn == 'yes')
                            panel.ownerCt.remove(panel, true);
                    });
                }
            }],
            layout: 'form',
            buttonAlign: 'center',
            buttons: [new Ext.Button({
                text: 'Done',
                hidden: qn.viewMode,
                handler: function (btn) {
                    btn.ownerCt.ownerCt.toggleCollapse(false);
                }
            })],
            items: [
				new Ext.form.TextField({
				    fieldLabel: 'Question Title',
				    anchor: '100%',
				    value: title,

				    listeners: {
				        'blur': function (txt) {
				            var p = txt.ownerCt;
				            p.setTitle(txt.getValue());
				        }
				    }
				}),
				cmbType,
				new Ext.Panel({
				    border: false,
				    bodyStyle: 'padding: 5px',
				    anchor: '100%',

				    createOption: function (index, xtype, value) {
				        if (!value) {
				            value = 'Option ' + index;
				        }

				        var qform = this;
				        var comp = new Ext.form.CompositeField({
				            style: 'margin-bottom: 5px',
				            items: [{
				                xtype: xtype,
				                name: qform.id,
				                value: (xtype == 'displayfield') ? index + '. ' : ''
				            },
								new Ext.form.TextField({
								    flex: 1,
								    index: index,
								    value: value,
								    listeners: {
								        'focus': function (txt) {
								            if (txt.getValue() == 'Option ' + txt.index) {
								                txt.setValue('');
								            }
								        },
								        'blur': function (txt) {
								            if (!txt.getValue()) {
								                txt.setValue('Option ' + txt.index);
								            }
								        }
								    }
								}),
								new Ext.Button({
								    text: 'X',
								    width: 20,
								    index: index,
                                    hidden: qn.viewMode,
								    handler: function (btn) {
								        if (qform.items.length > 2)
								            qform.remove(comp, true);
								    }
								})
					    	]
				        });

				        return comp;

				    },

                    createGridLabel: function (index, type, refPanel, value) {
				        if (!value) {
				            value = type + ' ' + index;
				        }

				        var qform = this;
				        var comp = new Ext.form.CompositeField({
				            style: 'margin-bottom: 5px',
				            items: [
                                new Ext.form.TextField({
								    flex: 1,
								    index: index,
								    value: value,
								    listeners: {
								        'focus': function (txt) {
								            if (txt.getValue() == type + ' ' + txt.index) {
								                txt.setValue('');
								            }
								        },
								        'blur': function (txt) {
								            if (!txt.getValue()) {
								                txt.setValue(type + ' ' + txt.index);
								            }
								        }
								    }
								}),
								new Ext.Button({
								    text: 'X',
								    width: 20,
								    index: index,
                                    hidden: qn.viewMode,
								    handler: function (btn) {
								        if (refPanel.items.length > 2)
								            refPanel.remove(comp, true);
								    }
								})
					    	]
				        });

				        return comp;

				    },

				    createScale: function (start, end, startText, endText) {
				        var startLabel = new Ext.form.DisplayField({
				            value: start
				        });
				        var endLabel = new Ext.form.DisplayField({
				            value: end
				        });

				        return [new Ext.form.CompositeField({
				            items: [
                                new Ext.form.DisplayField({
                                    value: 'Scale'
                                }),
                                new Ext.form.ComboBox({
                                    mode: 'local',
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    editable: false,
                                    cls: 'white-field',
                                    width: 50,
                                    readOnly: qn.viewMode,
                                    store: new Ext.data.ArrayStore({
                                        fields: [
					                        'id',
					                        'name'
				                        ],
                                        data: [[0, 0], [1, 1]]
                                    }),
                                    listeners: {
                                        'select': function (cmb) {
                                            startLabel.setValue(cmb.getValue());
                                        }
                                    },
                                    value: startLabel.getValue(),
                                    valueField: 'id',
                                    displayField: 'name'
                                }),
                                new Ext.form.DisplayField({
                                    value: 'to'
                                }),
                                new Ext.form.ComboBox({
                                    mode: 'local',
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    editable: false,
                                    cls: 'white-field',
                                    width: 50,
                                    readOnly: qn.viewMode,
                                    store: new Ext.data.ArrayStore({
                                        fields: [
					                        'id',
					                        'name'
				                        ],
                                        data: [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]]
                                    }),
                                    listeners: {
                                        'select': function (cmb) {
                                            endLabel.setValue(cmb.getValue());
                                        }
                                    },
                                    value: endLabel.getValue(),
                                    valueField: 'id',
                                    displayField: 'name'
                                })
                            ]
				        }), new Ext.form.DisplayField({
				            value: 'Label (Optional)',
				            style: 'margin-top: 5px; margin-bottom: 5px;'
				        }),
                        new Ext.form.CompositeField({
                            style: 'margin-bottom: 5px;',
                            items: [
                                startLabel,
                                new Ext.form.TextField({
                                    width: 200,
                                    style: 'margin-left: 5px',
                                    value: startText
                                })
                            ]
                        }),
                        new Ext.form.CompositeField({
                            items: [
                                endLabel,
                                new Ext.form.TextField({
                                    width: 200,
                                    style: 'margin-left: 5px',
                                    value: endText
                                })
                            ]
                        })];
				    },

				    createGrid: function () {
				        var grid = new Array();

				        var colSelect = new Ext.form.CompositeField({
				            items: [
                                new Ext.form.DisplayField({
                                    value: 'Columns'
                                }),
                                new Ext.form.ComboBox({
                                    mode: 'local',
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    editable: false,
                                    cls: 'white-field',
                                    width: 50,
                                    store: new Ext.data.ArrayStore({
                                        fields: [
					                        'id',
					                        'name'
				                        ],
                                        data: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
                                    }),
                                    listeners: {
                                        'select': function (cmb) {
                                            var num = cmb.getValue();
                                            for (var i = 0; i < num; i++) {
                                                grid.push(
                                                    new Ext.form.CompositeField({
                                                        style: 'margin-bottom: 5px;',
                                                        items: [
                                                            new Ext.form.DisplayField({
                                                                value: 'Column ' + (i + 1) + ' Label'
                                                            }),
                                                            new Ext.form.TextField({
                                                                width: 200
                                                            })
                                                        ]
                                                    })
                                                );
                                            }
                                        }
                                    },
                                    valueField: 'id',
                                    displayField: 'name'
                                })
                            ]
				        });

				        grid.push(colSelect);

				        return grid;
				    }
				})
			]
        })

        if (!qtype) {
            qtype = 1;
        }
        cmbType.setValue(qtype);

        if (!manualCreate) {
            cmbType.fireEvent('select', cmbType);
        }

        return portlet;
    },

    initComponent: function () {
        var docID = this.docID;
        var qn = this;

        var col = new Ext.ux.PortalColumn({
            style: 'padding: 10px 5px 0 5px;',
            defaults: { bodyStyle: 'padding: 5px;' },
            columnWidth: 1,

            addPortlet: function (type, title, manualCreate) {
                if (col.items && !qn.viewMode) {
                    for (var i = 0; i < col.items.length; i++) {
                        var p = col.items.get(i);
                        if (!p.collapsed) {
                            p.toggleCollapse(false);
                        }
                    }
                }

                var portlet = qn.createQuestion(type, title, manualCreate, qn);
                col.add(portlet);
                col.doLayout();

                return portlet;
            }
        });

        var firstLayout = new Ext.Panel({
            layout: 'column',
            border: false,
            defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
            items: [
			    new Ext.Panel({
			        columnWidth: .34,
			        html: '<img src="resources/css/images/pixel.gif" />'
			    }),
			    new Ext.Panel({
			        border: false,
			        columnWidth: .33,
			        layout: 'form',
			        items: [
					    new Ext.form.DateField({
					        id: 'txt-qTmpDate',
					        fieldLabel: 'Q Temp Date',
					        format: 'd/m/Y',
					        editable: false,
					        name: 'docDate',
					        anchor: '100%',
					        value: new Date()
					    })
				    ]
			    }),
			    new Ext.Panel({
			        border: false,
			        columnWidth: .33,
			        layout: 'form',
			        items: [
					    new Ext.form.TextField({
					        id: 'txt-qTmpNo',
					        fieldLabel: 'Q Temp No',
					        name: 'docNo',
					        anchor: '100%'
					    })
				    ]
			    })
			]
        });

        var form = new Ext.form.FormPanel({
            autoHeight: true,
            border: false,

            items: [
			    firstLayout,
				new Ext.Panel({
				    layout: 'column',
				    border: false,
				    defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
				    items: [
						new Ext.Panel({
						    border: false,
						    columnWidth: 1,
						    layout: 'form',
						    items: [
								new Ext.form.TextField({
								    fieldLabel: 'Title',
								    name: 'qName',
								    anchor: '100%'
								}),
						    //								new Ext.form.TextField({
						    //								    fieldLabel: 'Approve',
						    //								    name: 'approved',
						    //								    anchor: '100%'
						    //								}),
								new Ext.form.TextArea({
								    fieldLabel: 'Description',
								    name: 'qDesc',
								    anchor: '100%'
								})
							]
						}),

						new Ext.Panel({
						    border: false,
						    columnWidth: .5,
						    layout: 'form',
						    items: [
			                    new Ext.form.DateField({
			                        id: 'txt-startDate',
			                        fieldLabel: 'Start Date',
			                        format: 'd/m/Y',
			                        editable: false,
			                        name: 'sDate',
			                        anchor: '100%'
			                    })
		                    ]
						}),
	                    new Ext.Panel({
	                        border: false,
	                        columnWidth: .5,
	                        layout: 'form',
	                        items: [
			                    new Ext.form.DateField({
			                        id: 'txt-endDate',
			                        fieldLabel: 'End Date',
			                        format: 'd/m/Y',
			                        editable: false,
			                        name: 'eDate',
			                        anchor: '100%'
			                    })
		                    ]
	                    }),

						new Ext.ux.Portal({
						    columnWidth: 1,
						    title: 'Question List',
						    bodyStyle: 'border: solid 1px #CCC; background-color: #FAFAFA',
						    tbar: new Ext.Toolbar({
						        items: [
				            	    new Ext.Button({
				            	        text: 'Add Question',
                                        hidden: qn.viewMode,
				            	        menu: new Ext.menu.Menu({
				            	            items: [{
				            	                text: 'Text',
				            	                handler: function (btn) {
				            	                    col.addPortlet(1);
				            	                }
				            	            }, {
				            	                text: 'Paragraph text',
				            	                handler: function (btn) {
				            	                    col.addPortlet(2);
				            	                }
				            	            }, {
				            	                text: 'Multiple choice',
				            	                handler: function (btn) {
				            	                    col.addPortlet(3);
				            	                }
				            	            }, {
				            	                text: 'Checkboxes',
				            	                handler: function (btn) {
				            	                    col.addPortlet(4);
				            	                }
				            	            }, {
				            	                text: 'Scale',
				            	                handler: function (btn) {
				            	                    col.addPortlet(6);
				            	                }
				            	            }, {
				            	                text: 'Grid',
				            	                handler: function (btn) {
				            	                    col.addPortlet(7);
				            	                }
				            	            }]
				            	        })
				            	    })
			            	    ]
						    }),
						    items: [
				                col
			                ]
						})
					]
				})
			]
        });

        this.items = new Ext.Panel({
            border: false,
            layout: 'fit',
            items: form
        });

        if (docID) {
            show_loading();
            Ext.Ajax.request({
                url: 'json/QN.aspx',
                method: 'GET',
                params: { act: 'load-qn', docID: docID },
                success: function (result) {
                    var json = Ext.util.JSON.decode(result.responseText);
                    var tqHead = json.data;
                    qn.data = tqHead;

                    var f = form.getForm();
                    f.findField('qName').setValue(tqHead.qName);
                    f.findField('qDesc').setValue(tqHead.qDesc);
                    f.findField('docNo').setValue(tqHead.docNo);

                    if (tqHead.docDate) {
                        f.findField('docDate').setValue(Date.parseDate(tqHead.docDate, 'd/m/Y H:i:s'));
                    }
                    if (tqHead.startDate) {
                        f.findField('sDate').setValue(Date.parseDate(tqHead.startDate, 'd/m/Y H:i:s'));
                    }
                    if (tqHead.endDate) {
                        f.findField('eDate').setValue(Date.parseDate(tqHead.endDate, 'd/m/Y H:i:s'));
                    }
                    if (tqHead.approved == 1) {
                        Ext.getCmp('btn-preview').show();
                    }

                    var dets = tqHead.details;
                    var refColPanel = {};
                    if (dets) {
                        for (var i = 0; i < dets.length; i++) {
                            var tqDetail = dets[i];
                            if (tqDetail.qType == 1 || tqDetail.qType == 2) {
                                col.addPortlet(tqDetail.qType, tqDetail.title);
                            }
                            else if (tqDetail.qType == 3 || tqDetail.qType == 4 || tqDetail.qType == 5) {
                                var p = col.addPortlet(tqDetail.qType, tqDetail.title);

                                var op = p.items.get(2);
                                op.remove(0, true);

                                var xtype = (tqDetail.qType == 3) ? 'radio' : (tqDetail.qType == 4) ? 'checkbox' : 'displayfield';

                                seq = 1;
                                while (i + 1 < dets.length && dets[i + 1].gSeq != null) {
                                    op.insert(seq - 1, op.createOption(seq, xtype, dets[i + 1].title));
                                    seq++;
                                    i++;
                                }

                                op.doLayout();
                            }
                            else if (tqDetail.qType == 7) {
                                var tmbSeq = tqDetail.seq;
                                var p = col.addPortlet(tqDetail.qType, tqDetail.title);
                                var op = p.items.get(2);

                                var rowPanel = op.items.get(0);
                                rowPanel.remove(0, true);

                                seq = 1;
                                while (i + 1 < dets.length && dets[i + 1].gSeq != null) {
                                    rowPanel.insert(seq - 1, op.createGridLabel(seq, 'Row', rowPanel, dets[i + 1].title));
                                    seq++;
                                    i++;
                                }

                                var colPanel = op.items.get(2);
                                colPanel.remove(0, true);
                                refColPanel['colpanel-' + tmbSeq] = colPanel;

                                op.doLayout();
                            }
                            else if (tqDetail.qType == 6) {
                                var p = col.addPortlet(tqDetail.qType, tqDetail.title, true);

                                var op = p.items.get(2);
                                //op.removeAll();

                                var start = dets[i + 1].title.split(':');
                                var end = dets[i + 2].title.split(':');
                                op.add(op.createScale(start[0], end[0], start[1], end[1]));
                                op.doLayout();

                                i += 2
                            }
                        }
                    }

                    var cols = tqHead.columns;
                    if (cols) {
                        for (var i = 0; i < cols.length; i++) {
                            var tqColumn = cols[i];
                            var colPanel = refColPanel['colpanel-' + tqColumn.pSeq];
                            if (colPanel) {
                                var index = colPanel.items.length;
                                colPanel.insert(index - 1, op.createGridLabel(tqColumn.seq + 1, 'Column', colPanel, cols[i].colName));
                                colPanel.ownerCt.ownerCt.doLayout();
                            }
                        }
                    }

                    hide_loading();
                }
            });
        }
        else {
            col.addPortlet(1);
        }

        var mainBody = this.mainBody;
        var tabBody = this.tabBody;

        var saveQn = function (form, callback) {
            var tqHead = {
                qName: null,
                qDesc: null,

                details: [],
                columns: []
            }
            var f = form.getForm();

            var docNo = f.findField('docNo').getValue();
            var docDate = f.findField('docDate').getValue();
            var sDate = f.findField('sDate').getValue();
            var eDate = f.findField('eDate').getValue();

            tqHead.qName = f.findField('qName').getValue();
            tqHead.qDesc = f.findField('qDesc').getValue();

            var seq = 1;
            var colSeq = 1;
            for (var i = 0; i < col.items.length; i++) {
                var p = col.items.get(i);
                var title = p.items.get(0);
                var type = p.items.get(1);
                var qq = p.items.get(2);

                var tqDetail = {
                    seq: seq,
                    gSeq: null,
                    title: title.getValue(),
                    qType: type.getValue()
                };
                tqHead.details.push(tqDetail);

                if (tqDetail.qType == 3 || tqDetail.qType == 4 || tqDetail.qType == 5) {
                    for (var j = 0; j < qq.items.length - 1; j++) {
                        var c = qq.items.get(j);
                        var txt = c.items.get(1);

                        tqDetail = {
                            seq: seq + (j + 1),
                            gSeq: seq,
                            title: txt.getValue(),
                            qType: type.getValue()
                        };
                        tqHead.details.push(tqDetail);
                    }
                    seq += qq.items.length;
                }
                else if (tqDetail.qType == 7) {
                    var tmpSeq = seq;

                    var rowPanel = qq.items.get(0);
                    for (var j = 0; j < rowPanel.items.length - 1; j++) {
                        var c = rowPanel.items.get(j);
                        var txt = c.items.get(0);

                        tqDetail = {
                            seq: seq + (j + 1),
                            gSeq: tmpSeq,
                            title: txt.getValue(),
                            qType: type.getValue()
                        };
                        tqHead.details.push(tqDetail);
                    }
                    seq += rowPanel.items.length;

                    var colPanel = qq.items.get(2);
                    for (var j = 0; j < colPanel.items.length - 1; j++) {
                        var c = colPanel.items.get(j);
                        var txt = c.items.get(0);

                        var tqColumn = {
                            seq: seq + (j + 1),
                            pSeq: tmpSeq,
                            colName: txt.getValue()
                        };
                        tqHead.columns.push(tqColumn);
                    }
                    colSeq += colPanel.items.length;
                }
                else if (tqDetail.qType == 6) {
                    var start = qq.items.get(0).items.get(1).getValue();
                    var end = qq.items.get(0).items.get(3).getValue();
                    var startLabel = qq.items.get(2).items.get(1).getValue();
                    var endLabel = qq.items.get(3).items.get(1).getValue();

                    tqHead.details.push({
                        seq: seq + 1,
                        gSeq: seq,
                        title: start + ':' + startLabel,
                        qType: type.getValue()
                    });
                    tqHead.details.push({
                        seq: seq + 2,
                        gSeq: seq,
                        title: end + ':' + endLabel,
                        qType: type.getValue()
                    });

                    tqHead.columns.push({
                        seq: seq + 1,
                        pSeq: seq,
                        colName: startLabel
                    });
                    tqHead.columns.push({
                        seq: seq + 2,
                        pSeq: seq,
                        colName: endLabel
                    });

                    seq += 3;
                }
                else {
                    seq++;
                }
            }

            show_loading();
            Ext.Ajax.request({
                url: 'json/QN.aspx',
                method: 'POST',
                params: { act: 'save-qn', docID: docID, docNo: docNo, docDate: docDate, sDate: sDate, eDate: eDate, tqValues: Ext.util.JSON.encode(tqHead) },
                success: function (result) {
                    hide_loading();

                    var json = Ext.util.JSON.decode(result.responseText);
                    if (typeof callback == 'function') {
                        callback(json);
                    }
                }
            });
        };

        var btnSave = new Ext.Button({
            text: 'Save',
            handler: function () {
                saveQn(form, function (json) {
                    if (json.success) {
                        show_info('Your data have been save successful', 'Message', function () {
                            hide_loading();

                            tabBody.removeAll();
                            tabBody.add(new Senate.QN({
                                docID: json.keyValue,
                                mainBody: mainBody,
                                tabBody: tabBody
                            }));
                            tabBody.doLayout();
                        });
                    }
                    else {
                        show_error(json.errMessage, 'Error');
                    }
                });
            }
        });

        var btnSubmit = new Ext.Button({
            text: 'Submit',
            handler: function () {
                saveQn(form, function (json) {
                    if (json.success) {
                        invoke_method({
                            method: 'submitDocToDF',
                            params: [
						        { type: 1, value: json.keyValue },
						        { type: 1, value: 26001 },
						        { type: 1, value: 5001 }
					        ]
                        }, function (result) {
                            if (result.success) {
                                show_info('Your document have been submitted successful', 'Message', function () {
                                    hide_loading();

                                    tabBody.removeAll();
                                    tabBody.add(new Senate.QN({
                                        docID: json.keyValue,
                                        mainBody: mainBody,
                                        tabBody: tabBody
                                    }));
                                    tabBody.doLayout();
                                });
                            }
                        });
                    }
                    else {
                        show_error(json.errMessage, 'Error');
                    }
                });
            }
        });

        var btnPreview = new Ext.Button({
            id: 'btn-preview',
            text: 'Preview',
            hidden: true,
            handler: function () {
                var h = 500;
                var w = 800;
                var left = (screen.width / 2) - (w / 2);
                var top = (screen.height / 2) - (h / 2);
                window.open("PreviewQN.aspx", "Preview", "titlebar=no,statusbar=no,menubar=no,resizable=no,scrollbars=yes,width=" + w + ",height=" + h + ",top=" + top + ",left=" + left);
            }
        });

        var btnBack = new Ext.Button({
            text: 'Back',
            handler: function () {
                tabBody.removeAll();
                var tab = new Senate.QNTab({
                    mainBody: mainBody,
                    tabBody: tabBody
                });
                tabBody.add(tab.items.get(0));
                tabBody.doLayout();
            }
        });
        
        var tbar = qn.mainBody.getTopToolbar();
        for (var i = tbar.items.length - 1; i > 1; i--) {
            tbar.remove(i);
        }

        if (!qn.viewMode) {
            tbar.add(btnSave);
            tbar.add(btnSubmit);
            tbar.add(btnPreview);
            tbar.add(btnBack);
        }
           
        tbar.doLayout();

        Senate.QN.superclass.initComponent.call(this);
    }
});

Senate.QNTab = Ext.extend(Ext.TabPanel, {
	//id: 'qn-tab',	
	border: false,
    frame: true,
    activeTab: 0,
    
    initComponent: function() {   
//		this.items = [new Senate.QN({
//		    refTBar: this.mainBody.getTopToolbar()
//		})];
        
        var mainBody = this.mainBody;
		var tabBody = this.tabBody;
        if (mainBody) {
            var tbar = mainBody.getTopToolbar();
            for (var i = tbar.items.length - 1; i > 1; i--) {
			    tbar.remove(i);
		    }
		    tbar.add(new Ext.Button({
                text: 'Create Questionnaire',
                handler: function() {
                    tabBody.removeAll();
				    tabBody.add(new Senate.QN({
				        mainBody: mainBody,
					    tabBody: tabBody
				    }));
				    tabBody.doLayout();
                }
            }));
            tbar.doLayout();
        }

        var ds = new Ext.data.Store({
			autoLoad: true,
			baseParams: { act: 'load-qn-list' },
			proxy: new Ext.data.HttpProxy({
				method: 'GET',
				url: 'json/QN.aspx'					
			}),
			reader: new Ext.data.ArrayReader({
				root: 'data',
				totalProperty: 'total'
			}, [
				{ name: 'DocID' },
				{ name: 'QName' },
				{ name: 'QDesc' },
				{ name: 'CreateDate' }
			])
		});
		
		this.items = [new Ext.Panel({
			//title: 'Questionnaire',
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
						store: ds,
						colModel: new Ext.grid.ColumnModel([
							new Ext.grid.Column({ 
								header: 'DocID', 
								dataIndex: 'DocID',
								hidden: true
							}),
							new Ext.grid.Column({ 
								header: 'QName', 
								dataIndex: 'QName',
								width: 20
							}),
							new Ext.grid.Column({ 
								header: 'QDesc', 
								dataIndex: 'QDesc',
								width: 60
							}),
							new Ext.grid.Column({ 
								header: 'CreateDate', 
								dataIndex: 'CreateDate',
								width: 15
							}),
							new Ext.grid.ActionColumn({
				                align: 'center',
				                width: 5,
				                items: [{
				                    icon: 'resources/css/images/icons/page_go.png',
				                    tooltip: 'Go',
				                    handler: function(grid, rowIndex, colIndex) {
				                    	var rec = grid.getStore().getAt(rowIndex);
										var docID = rec.get('DocID');
										
										tabBody.removeAll();
				            		    tabBody.add(new Senate.QN({
				            		        docID: docID,
				            		        mainBody: mainBody,
											tabBody: tabBody
				            		    }));
				            		    tabBody.doLayout();
				                    }
				                }]
				            })
						]),
						viewConfig: { forceFit: true },
						bbar: new Ext.PagingToolbar({
							store: ds,
				            pageSize: 20,
				            displayInfo: true,
				            displayMsg: 'Displaying results {0} - {1} of {2}',
				            emptyMsg: "No results to display"
				        })
					})
				})
			})
		})];
    	
    	Senate.QNTab.superclass.initComponent.call(this);
    }
});

Senate.QNWindow = function() {
	Senate.QNWindow.superclass.constructor.call(this, {
    	layout: 'fit',
		ctCls: 'body-panel',
		margins: '0 5 0 0',
		padding: 5,
		width: 720,
		height: 450,
		autoScroll: true,
		closeAction: 'close',
		closable: true,
		resizable: true,
		maximizable: true,
		//minimizable: true,
		modal: true,
		draggable: true,
		buttonAlign: 'center',
		tbar: new Ext.Toolbar()
	});
};
Ext.extend(Senate.QNWindow, Ext.Window, {    
    initComponent: function() {
    	Senate.QNWindow.superclass.initComponent.call(this);
    },
    
    open: function(data) {
//        var json = '{"qName":"Test 1","qDesc":"Hello World","details":[{"seq":1,"gSeq":null,"qType":1,"title":"Q 1"},{"seq":2,"gSeq":null,"qType":2,"title":"Q 2"},{"seq":3,"gSeq":null,"qType":3,"title":"Q 3"},{"seq":4,"gSeq":3,"qType":3,"title":"Q 3 - 1"},{"seq":5,"gSeq":3,"qType":3,"title":"Q 3 - 2"},{"seq":6,"gSeq":null,"qType":4,"title":"Q 4"},{"seq":7,"gSeq":6,"qType":4,"title":"Q 4 - 1"},{"seq":8,"gSeq":6,"qType":4,"title":"Q 4 - 2"},{"seq":9,"gSeq":6,"qType":4,"title":"Q 4 - 3"}]}';
//        var data = Ext.util.JSON.decode(json);
		
		var qPanel = new Ext.Panel({		
			layout: 'column',			
			border: false,
			defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
			items: new Ext.Panel({
				border: false,
				columnWidth: 1,
				layout: 'form',
				items: [
					new Ext.form.DisplayField({
						fieldLabel: 'Title',
						anchor: '100%',
						value: data.qName
					}),
					new Ext.form.DisplayField({
						fieldLabel: 'Description',
						anchor: '100%',
						value: data.qDesc
					})				
				]
			})
		});
	
		var qnList = qPanel.items.get(0);
	
		for (var i = 0; i < data.details.length; i++) {
			var qq = data.details[i];
			
			var items = new Ext.Panel({    	
				border: false,
				layout: 'form',
				items: [
					new Ext.form.DisplayField({
						fieldLabel: 'Question',
						anchor: '100%',
						value: qq.title
					})					
				]
			});
			
			var fs = new Ext.form.FieldSet({
				title: 'Question ' + qq.seq,
				collapsed: false,
				collapsible: true,
        		autoHeight: true,
				items: items
			});
			
			switch (qq.qType) {
				case 1: {
					items.add(new Ext.form.TextField({
						fieldLabel: 'Answer',
						anchor: '100%'
					}));
					break;
				}
				case 2: {
					items.add(new Ext.form.TextArea({
						fieldLabel: 'Answer',
						anchor: '100%'
					}));
					break;
				}
				case 3: {
					var options = new Array();
					var seq = qq.seq;
					var index = i + 1;
					while (data.details[index] && data.details[index].gSeq == seq) {
						options.push({ boxLabel: data.details[index].title, name: 'opt-' + seq + '-' + data.details[index].gSeq });
						
						index++;
						i++;
					}
					
					items.add(new Ext.form.CheckboxGroup({
						fieldLabel: 'Answer',
						columns: 1,
						items: options
					}));
					break;
				}
				case 4: {
					var options = new Array();
					var seq = qq.seq;
					var index = i + 1;
					while (data.details[index] && data.details[index].gSeq == seq) {
						options.push({ boxLabel: data.details[index].title, name: 'opt-' + seq + '-' + data.details[index].gSeq });
						
						index++;
						i++;
					}
					
					items.add(new Ext.form.RadioGroup({
						fieldLabel: 'Answer',
						columns: 1,
						items: options
					}));
					break;
				}
			}
			
			qnList.add(fs);
		}
    
        var win = this;
    	var form = new Ext.FormPanel({
    		id: 'win-qn',
			border: false,
	        frame: true,
			bodyStyle: 'overflow-y: scroll',
			items: qPanel
    	});    	
    	this.add(form);  
    	this.addButton(new Ext.Button({
    		text: 'Close',
    		handler: function() {
    			win.close();
    			win.destroy();
    		}
    	}));
    	this.doLayout();
    	this.show();
    }
});
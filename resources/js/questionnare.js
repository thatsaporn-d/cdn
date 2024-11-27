QNForm = Ext.extend(Ext.form.FormPanel, {
    id: 'qn-form',
    border: false,
    frame: true,
    docID: null,
    viewMode: false,

    buttonAlign: 'center',
    buttons: [
	    {
	        text: 'Save',
	        handler: function () {
	            var list = Ext.getCmp('qn-items');
	            var ansArr = new Array();
	            for (var i = 0; i < list.items.length; i++) {
	                var fs = list.items.get(i);
	                if (fs.qtype) {
	                    //qseq, qgseq, qanswertext
	                    switch (fs.qtype) {
	                        case 1:
	                            {
	                                var txtField = fs.items.get(0).items.get(1);
	                                var val = txtField.getValue();
	                                if (val && val.trim().length > 0) {
	                                    var ans = {
	                                        qseq: txtField.seq,
	                                        qanswertext: txtField.getValue()
	                                    };
	                                    ansArr.push(ans);
	                                }
	                                break;
	                            }
	                        case 2:
	                            {
	                                var txtField = fs.items.get(0).items.get(1);
	                                var val = txtField.getValue();
	                                if (val && val.trim().length > 0) {
	                                    var ans = {
	                                        qseq: txtField.seq,
	                                        qanswertext: txtField.getValue()
	                                    };
	                                    ansArr.push(ans);
	                                }
	                                break;
	                            }
	                        case 3:
	                            {
	                                var options = fs.items.get(0).items.get(1);
	                                var selected = options.getValue();
	                                for (var j = 0; j < selected.length; j++) {
	                                    var ans = {
	                                        qseq: selected[j].seq,
	                                        qgseq: selected[j].gseq
	                                    };
	                                    ansArr.push(ans);
	                                }
	                                break;
	                            }
	                        case 4:
	                            {
	                                var options = fs.items.get(0).items.get(1);
	                                var selected = options.getValue();
	                                if (selected) {
	                                    var ans = {
	                                        qseq: selected.seq,
	                                        qgseq: selected.gseq
	                                    };
	                                    ansArr.push(ans);
	                                }
	                                break;
	                            }
	                        case 6:
	                            {
	                                var res = fs.items.get(0).items.get(1).items.get(1);
	                                var seq = parseInt(res.id.split('-')[1]);
	                                var val = res.getValue().inputValue;

	                                if (res) {
	                                    var ans = {
	                                        qseq: val,
	                                        qgseq: seq
	                                    };
	                                    ansArr.push(ans);
	                                }
	                                break;
	                            }
                            case 7: 
                                {
                                    var comp = fs.items.get(0).items.get(1);
                                    var table = Ext.query('#ans-' + comp.refSeq);
                                    var rowCount = Ext.query('#ans-' + comp.refSeq + ' tbody tr').length;
                                    for (var j = 0; j < rowCount; j++) {
                                        var rads = Ext.query('#ans-' + comp.refSeq + ' [name=rad-' + comp.refSeq + '-' + j + ']');
                                        var val = 0;
                                        for (var k = 0; k < rads.length; k++) {
                                            if (rads[k].checked) {
                                                val = parseInt(rads[k].value);
                                                break;
                                            }
                                        }

	                                    var ans = {
	                                        qseq: val,
	                                        qgseq: comp.refSeq
	                                    };
	                                    ansArr.push(ans);
                                    }

                                    break;
                                }
	                    }
	                }
	            }

	            var form = Ext.getCmp('qn-form');
	            form.getForm().submit({
	                url: 'json/QN.aspx',
	                method: 'POST',
	                params: { act: 'save-qn-ans', docID: form.docID, answer: Ext.util.JSON.encode(ansArr) },
	                success: function (f, result) {
	                    if (result.result.success) {
	                        form.docID = result.result.keyValue;

	                        show_info();

	                        Ext.Msg.show({
	                            title: 'Success',
	                            msg: 'Your data has been successfully saved',
	                            icon: Ext.Msg.INFO,
	                            buttons: Ext.Msg.OK
	                        });
	                    }
	                    else {
	                        Ext.Msg.show({
	                            title: 'Error',
	                            msg: result.result.errMessage,
	                            icon: Ext.Msg.ERROR,
	                            buttons: Ext.Msg.OK
	                        });
	                    }
	                },
	                failure: function (f, result) {
	                    Ext.Msg.show({
	                        title: 'Error',
	                        msg: result.result.errMessage,
	                        icon: Ext.Msg.ERROR,
	                        buttons: Ext.Msg.OK
	                    });
	                }
	            });
	        }
	    }
	],

    showLoading: function () {
        this.mask = new Ext.LoadMask(document.getElementById('qn-layout'), { msg: 'Please wait...' });
        this.mask.show();
    },
    hideLoading: function () {
        this.mask.hide();
    },

    initComponent: function () {
        var form = this;

        if (!form.docID) {
            form.docID = gup('DocID');
        }

        var ctid = gup('CTID');
        var qid = gup('QID');

        var docID = form.docID;
        var viewMode = form.viewMode;

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
					        id: 'txt-qdate',
					        fieldLabel: 'Q Date',
					        format: 'd/m/Y',
					        editable: false,
					        anchor: '100%',
					        name: 'qdate',
					        style: 'text-align: center',
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
					        id: 'txt-qno',
					        fieldLabel: 'Q No',
					        name: 'qno',
					        style: 'text-align: center',
					        anchor: '100%'
					    })
				    ]
			    })
			]
        });

        var layout0 = new Ext.Panel({
            layout: 'column',
            border: false,
            defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
            items: [
			    new Ext.Panel({
			        border: false,
			        columnWidth: .35,
			        layout: 'form',
			        items: [
				        new Ext.form.TextField({
				            id: 'hid-ctid',
				            name: 'ctid',
				            tfName: 'CTID',
				            hidden: true
				        }),
					    new Ext.Panel({
					        border: false,
					        layout: 'hbox',
					        fieldLabel: 'Customer Code',
					        items: [
					            new Ext.form.TextField({
					                id: 'txt-cusCode',
					                name: 'ctcode',
					                tfName: 'CTCode',
					                flex: 1,
					                style: 'text-align: center',
					                anchor: '100%',
					                readOnly: true
					            }),
					            new Ext.Button({
					                text: '...',
					                margins: '0 0 0 5',
					                disabled: viewMode,
					                handler: function () {
					                    new SelectOneWindow().open(
    					                    4002011, [
    					                        Ext.getCmp('hid-ctid'),
    					                        Ext.getCmp('txt-cusCode'),
    					                        Ext.getCmp('txt-cusName')
    					                    ]
    					                );
					                }
					            })
				            ]
					    })
				    ]
			    }),
			    new Ext.Panel({
			        border: false,
			        columnWidth: .65,
			        layout: 'form',
			        items: [
					    new Ext.form.TextField({
					        id: 'txt-cusName',
					        fieldLabel: 'Customer Name',
					        name: 'ctname',
					        tfName: 'CTName',
					        anchor: '100%',
					        readOnly: true
					    })
				    ]
			    })
			]
        });

        var layout1 = new Ext.Panel({
            layout: 'column',
            border: false,
            defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
            items: [
			    new Ext.Panel({
			        border: false,
			        columnWidth: .5,
			        layout: 'form',
			        items: [
				        new Ext.form.TextField({
				            id: 'hid-qid',
				            name: 'qid',
				            tfName: 'QID',
				            hidden: true
				        }),
					    new Ext.Panel({
					        border: false,
					        layout: 'hbox',
					        fieldLabel: 'Q Template',
					        items: [
					            new Ext.form.TextField({
					                id: 'txt-qname',
					                name: 'qname',
					                tfName: 'QName',
					                flex: 1,
					                style: 'text-align: center',
					                anchor: '100%',
					                readOnly: true
					            }),
					            new Ext.Button({
					                text: '...',
					                margins: '0 0 0 5',
					                disabled: viewMode,
					                handler: function () {
					                    new SelectOneWindow().open(
    					                    5002, [
    					                        Ext.getCmp('hid-qid'),
    					                        Ext.getCmp('txt-qname')
    					                    ],
    					                    function () {
    					                        form.showLoading();

    					                        Ext.Ajax.request({
    					                            url: 'json/QN.aspx',
    					                            method: 'GET',
    					                            params: { act: 'load-qn', docID: Ext.getCmp('hid-qid').getValue() },
    					                            success: function (result) {
    					                                var json = Ext.util.JSON.decode(result.responseText);
    					                                var qPanel = createQN(json.data, form.viewMode);
    					                                var layout = Ext.getCmp('qn-layout');
    					                                layout.removeAll();
    					                                layout.add(qPanel);
    					                                layout.doLayout();

    					                                form.hideLoading();
    					                            }
    					                        });
    					                    }
    					                );
					                }
					            })
				            ]
					    }),
			            new Ext.form.DateField({
			                id: 'txt-adate',
			                fieldLabel: 'Ans Date',
			                format: 'd/m/Y',
			                editable: false,
			                anchor: '100%',
			                name: 'ansdate',
			                style: 'text-align: center',
			                value: new Date()
			            })
				    ]
			    }),
			    new Ext.Panel({
			        border: false,
			        columnWidth: .5,
			        layout: 'form',
			        items: [
				        new Ext.form.TextField({
				            id: 'hid-eid',
				            name: 'eid',
				            tfName: 'EventID',
				            hidden: true
				        }),
					    new Ext.Panel({
					        border: false,
					        layout: 'hbox',
					        fieldLabel: 'Event',
					        items: [
					            new Ext.form.TextField({
					                id: 'txt-ename',
					                name: 'event_name',
					                tfName: 'Event_Name',
					                flex: 1,
					                style: 'text-align: center',
					                anchor: '100%',
					                readOnly: true
					            }),
					            new Ext.Button({
					                text: '...',
					                margins: '0 0 0 5',
					                disabled: viewMode,
					                handler: function () {
					                    new SelectOneWindow().open(
    					                    5003, [
    					                        Ext.getCmp('hid-eid'),
    					                        Ext.getCmp('txt-ename')
    					                    ]
    					                );
					                }
					            })
				            ]
					    })
				    ]
			    })
			]
        });

        //	    var layout1 = new Ext.Panel({		
        //			layout: 'column',			
        //			border: false,
        //			defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
        //			items: new Ext.Panel({
        //				border: false,
        //				columnWidth: 1,
        //				layout: 'form',
        //				items: [
        //				    new Ext.form.ComboBox({
        //				        id: 'cmb-qid',
        //				        fieldLabel: 'Questionnare',
        //				        anchor: '100%',
        //				        hiddenName: 'qid',
        //				        readOnly: form.viewMode,
        //				        value: qid,
        //        				
        //        		        typeAhead: true,
        //			            triggerAction: 'all',
        //			            store: new Ext.data.Store({
        //				            comboId: 'cmb-qid',
        //			    	        baseParams: { tbID: 9006 },
        //					        autoLoad: true,
        //					        proxy: new Ext.data.HttpProxy({
        //						        method: 'GET',
        //						        url: Senate.url.Combo	
        //					        }),
        //					        reader: new Ext.data.ArrayReader({
        //						        root: 'data'
        //					        }, [
        //						        { name: 'id' }, 
        //						        { name: 'name' }
        //					        ]),
        //					        listeners: {
        //			                    'load': function(store) {			            	
        //			            	        var cmb = Ext.getCmp(store.comboId);
        //			            	        cmb.setValue(cmb.getValue());
        //			            	     }
        //			            	}
        //				        }),	
        //				        listeners: {
        //				            'select': function(cmb) {
        //				                form.showLoading();
        //                                
        //                                Ext.Ajax.request({
        //                                    url: 'json/QN.aspx',
        //                                    method: 'GET',
        //                                    params: { act: 'load-qn', docID: cmb.getValue() },
        //                                    success: function(result) {
        //	                                    var json = Ext.util.JSON.decode(result.responseText);
        //		                                var qPanel = createQN(json.data, form.viewMode);        		                        
        //		                                var layout = Ext.getCmp('qn-layout');
        //		                                layout.removeAll();
        //		                                layout.add(qPanel);
        //		                                layout.doLayout();
        //		                                
        //		                                form.hideLoading();
        //	                                }
        //	                            });
        //				            }
        //				        },
        //				        mode: 'local',
        //			            valueField: 'id',
        //			            displayField: 'name'
        //			        })
        //				]
        //			})
        //		});

        var layout2 = new Ext.Panel({
            id: 'qn-layout',
            style: 'padding: 5px',
            bodyStyle: 'padding: 10px; background-color: #FAFAFA'
        });
        form.items = [firstLayout, layout0, layout1, layout2];

        QNForm.superclass.initComponent.call(this);

        if (viewMode) {
            form.buttons[0].hide();
        }
    },

    listeners: {
        'afterlayout': function (form) {
            if (form.docID && !form.loaded) {
                form.loaded = true;

                var docID = form.docID;

                if (docID) {
                    Ext.Ajax.request({
                        url: 'json/QN.aspx',
                        method: 'GET',
                        params: { act: 'load-qn-ans', docID: docID },
                        success: function (result) {
                            var json = Ext.util.JSON.decode(result.responseText);

                            if (json.success) {
                                var head = json.data;

                                var f = form.getForm();

                                for (h in head) {
                                    f.findField(h).setValue(head[h]);
                                }

                                //                                f.findField('ctid').setValue(head['ctid']);
                                //                                f.findField('txt-cusName').setValue(head['ctname']);
                                //                                f.findField('txt-cusCode').setValue(head['ctcode']);
                                //                                f.findField('qid').setValue(head['qid']);

                                var detail = json.details;

                                form.showLoading();

                                Ext.Ajax.request({
                                    url: 'json/QN.aspx',
                                    method: 'GET',
                                    params: { act: 'load-qn', docID: head['qid'] },
                                    success: function (result) {
                                        var json = Ext.util.JSON.decode(result.responseText);
                                        var qPanel = createQN(json.data, form.viewMode);
                                        var layout = Ext.getCmp('qn-layout');
                                        layout.removeAll();
                                        layout.add(qPanel);
                                        layout.doLayout();
                                        
                                        var count = -1;
                                        var rowIndex = 0;
                                        for (var i = 0; i < detail.length; i++) {
                                            var det = detail[i];
                                            var seq = det.qseq;
                                            if (det.qgseq) {
                                                seq = det.qgseq;
                                            }

                                            var cmp = Ext.getCmp('ans-' + seq);
                                            if (cmp) {
                                                if (cmp.getXType() == 'checkboxgroup') {
                                                    var key = 'opt-' + det.qseq + '-' + det.qgseq;
                                                    var json = {};
                                                    json[key] = true;
                                                    cmp.setValue(json);
                                                }
                                                else if (cmp.getXType() == 'radiogroup') {
                                                    if (cmp.columns == 1) {
                                                        cmp.setValue('opt-' + det.qseq + '-' + det.qgseq, true);
                                                    }
                                                    else {
                                                        cmp.setValue(det.qseq);
                                                    }
                                                }
                                                else {
                                                    cmp.setValue(det.qanswertext);
                                                }
                                            }
                                            else if (Ext.query('#ans-' + seq).length) {
                                                if (count != det.qgseq) {
                                                    count = det.qgseq;
                                                    rowIndex = 0;
                                                }                                                
                                                var rad = Ext.query('#ans-' + det.qgseq + ' [name=rad-' + det.qgseq + '-' + rowIndex + '][value=' + det.qseq + ']')[0];
												if (rad) {                                          
													rad.checked = true
													rowIndex++;
												}
                                            }
                                        }

                                        form.hideLoading();
                                    }
                                });
                            }
                            else {
                                Ext.Msg.show({
                                    title: 'Error',
                                    msg: json.errMessage,
                                    icon: Ext.Msg.ERROR,
                                    buttons: Ext.Msg.OK
                                });
                            }
                        }
                    });
                }
            }
        }
    }
});

function createQN(data, viewMode) {
    var qPanel = new Ext.Panel({		
        layout: 'column',			
        border: false,
        defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
        items: new Ext.Panel({
            id: 'qn-items',
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

    var qnum = 0;
    var qnList = qPanel.items.get(0);

    var columnArr = [];
    for (var i = 0; i < data.columns.length; i++) {
        var pseq = data.columns[i].pSeq;
        if (!columnArr['col-' + pseq]) {
            columnArr['col-' + pseq] = new Array();
        }
        columnArr['col-' + pseq].push(data.columns[i]);
    }

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
		
        switch (qq.qType) {
            case 1: {
                items.add(new Ext.form.TextField({
                    id: 'ans-' + qq.seq,
                    fieldLabel: 'Answer',
                    anchor: '100%',
                    seq: qq.seq,
                    gseq: qq.gSeq,
                    readOnly: viewMode
                }));

                qnum++;
                break;
            }
            case 2: {
                items.add(new Ext.form.TextArea({
                    id: 'ans-' + qq.seq,
                    fieldLabel: 'Answer',
                    anchor: '100%',
                    seq: qq.seq,
                    gseq: qq.gSeq,
                    readOnly: viewMode
                }));

                qnum++;
                break;
            }
            case 3: {
                var options = new Array();
                var seq = qq.seq;
                var index = i + 1;
                while (data.details[index] && data.details[index].gSeq == seq) {
                    options.push({ 
                        disabled: viewMode,
                        boxLabel: data.details[index].title, 
                        id: 'opt-' + data.details[index].seq + '-' + data.details[index].gSeq, 
                        name: 'opt-' + seq + '-' + data.details[index].gSeq, 
                        seq: data.details[index].seq, 
                        gseq: data.details[index].gSeq 
                    });
					
                    index++;
                    i++;
                }
				
                items.add(new Ext.form.CheckboxGroup({
                    id: 'ans-' + qq.seq,
                    fieldLabel: 'Answer',
                    columns: 1,
                    items: options
                }));

                qnum++;
                break;
            }
            case 4: {
                var options = new Array();
                var seq = qq.seq;
                var index = i + 1;
                while (data.details[index] && data.details[index].gSeq == seq) {
                    options.push({ 
                        disabled: viewMode,
                        boxLabel: data.details[index].title, 
                        id: 'opt-' + data.details[index].seq + '-' + data.details[index].gSeq, 
                        name: 'opt-' + seq + '-' + data.details[index].gSeq, 
                        seq: data.details[index].seq, 
                        gseq: data.details[index].gSeq 
                    });
					
                    index++;
                    i++;
                }
				
                items.add(new Ext.form.RadioGroup({
                    id: 'ans-' + qq.seq,
                    fieldLabel: 'Answer',
                    columns: 1,
                    items: options
                }));

                qnum++;
                break;
            }
        case 5: 
            {                
                break;
            }
        case 6:
            {
                var options = new Array();
                var seq = qq.seq;

                var start = data.details[index + 1];
                var startTag = start.title.split(':');
                var min = parseInt(startTag[0]);

                var end = data.details[index + 2];
                var endTag = end.title.split(':');
                var max = parseInt(endTag[0]);

                i += 2;

                var radArr = new Array();
                for (var j = min; j <= max; j++) {
                    radArr.push({
                        items: [
                            { xtype: 'label', text: j.toString() },
                            { name: 'rad-' + seq, inputValue: j }
                        ]
                    });
                }

                var radGroup = new Ext.form.RadioGroup({
                    id: 'ans-' + qq.seq,
                    fieldLabel: 'Answer',
                    vertical: false,
                    items: radArr
                });

                var comp = new Ext.form.CompositeField({
                    items: [{
                        style: 'padding-right: 12px; padding-top: 18px;',
                        xtype: 'displayfield',
                        value: startTag[1]
                    }, new Ext.Panel({
                        items: radGroup
                    }), {
                        style: 'padding-top: 18px;',
                        xtype: 'displayfield',
                        value: endTag[1]
                    }]
                });

                items.add(comp);

                qnum++;
                break;
            }
            case 7: {
                var options = new Array();
                var seq = qq.seq;
                var index = i + 1;
                var rows = new Array();
                while (data.details[index] && data.details[index].gSeq == seq) {
                    rows.push(data.details[index]);
					
                    index++;
                    i++;
                }
                var cols = columnArr['col-' + seq];

                var table = '<table id="ans-' + qq.seq + '">';

                var thead = '<thead><tr style="height: 30px;"><td style="width: 100px;"></td>';
                for (var j = 0; j < cols.length; j++) {
                    thead += '<td style="text-align: center; width: 100px;">' + cols[j].colName + '</td>';
                }
                thead += '</tr></thead>';
                table += thead;

                var tbody = '<tbody>';
                for (var j = 0; j < rows.length; j++) {
                    var tr = '<tr style="height: 20px;">';
                    tr += '<td>' + rows[j].title + '</td>';
                    for (var k = 0; k < cols.length; k++) {
                        tr += '<td style="text-align: center;"><input type="radio" name="rad-' + seq + '-' + j + '" value="' + cols[k].seq + '"/></td>';
                    }
                    tr += '</tr>';

                    tbody += tr;
                }
                tbody += '</tbody>';
                table += tbody;
                table += '</table>';
				
                items.add(new Ext.form.CompositeField({
                    fieldLabel: 'Answer',
                    refSeq: qq.seq,
                    items: [{ xtype: 'displayfield', value: '' }, new Ext.Panel({
                        style: 'font: normal 12px tahoma, arial, helvetica, sans-serif;',
                        html: table
                    })]
                }));

                qnum++;
                break;
            }
        }

        var fs = new Ext.form.FieldSet({
            title: 'Question ' + qnum,
            collapsed: false,
            qtype: qq.qType,
            collapsible: true,
            autoHeight: true,
            items: items
        });
		
        qnList.add(fs);
    }
    
    return qPanel;
}

function gup(name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if(results == null)
        return "";
    else
        return results[1];
}

SelectOneWindow = function() {
	SelectOneWindow.superclass.constructor.call(this, {
    	layout: 'fit',
	    ctCls: 'body-panel',
	    margins: '0 5 0 0',
	    padding: 5,
	    width: 720,
	    height: 480,
	    autoScroll: true,
	    closeAction: 'close',
	    closable: true,
	    resizable: true,
	    maximizable: true,
	    modal: true,
	    draggable: true,
	    buttonAlign: 'center',
        tbar: new Ext.Toolbar()
	});
};
Ext.extend(SelectOneWindow, Ext.Window, {
	initComponent: function() {	
	    SelectOneWindow.superclass.initComponent.call(this);
	},
	
	showLoading: function() {},
	hideLoading: function() {},
	
	open: function(fmID, fields, callback) {  
	    var win = this;
    	var form = new Senate.MainForm({
    		id: 'qwin-form',
    		fmID: fmID,
    		mainBody: win,
    		isWindow: true,
			bodyStyle: 'overflow-y: scroll'
    	});    	
    	win.add(form);
    	
    	win.getTopToolbar().add('->');
    	win.getTopToolbar().add(new Ext.Button({
    		text: 'Filter',
    		handler: function() {
    			var panel = Ext.getCmp('qwin-form');
    			var filterStr = '';
    			for (var i = 0; i < panel.dataFields.length; i++) {
					var field = panel.dataFields;
    				if (panel.findById(field[i]) != null) {
    					var f = panel.findById(field[i]);
    					var fieldName = f.getName();
    					var fieldValue = f.getValue();
    					filterStr += (fieldName + ';' + fieldValue + ';' + f.tfType);
    					if (i < panel.dataFields.length - 1) {
    						filterStr += '|';
    					}
    				}
    			}
    			
    			var grid = panel.details[0];
    			if (grid) {
	    			grid.getStore().setBaseParam('filterStr', filterStr);	    			
	    			if (panel.extSearch) {
	    			    var str = Ext.getCmp(panel.extSearch.field).getValue();
			            grid.getStore().setBaseParam('extSearch', str + ';' + panel.extSearch.expr);
	    			}	    			
			        if (grid.aggList) {
			            grid.getStore().setBaseParam('aggList', Ext.util.JSON.encode(grid.aggList));
			        }
	    			grid.getStore().load();
    			}
    		}
    	}));
    	win.addButton(new Ext.Button({
    		text: 'Select',
    		handler: function() {    			
    			var grid = Ext.getCmp('qwin-form').details[0];
    			if (grid) {
    			    var rec = grid.getSelectionModel().getSelected().data;
    			    
    			    for (var i = 0; i < fields.length; i++) {
    			        var f = fields[i];
    			        f.setValue(rec[f.tfName]);
    			    }
    			    
    			    if (callback) {
    			        callback();
    			    }
    			}
    			
				win.close();
				win.destroy();
    		}
    	}));
    	
    	win.addButton(new Ext.Button({
    		text: 'Close',
    		handler: function() {
    			win.close();
    			win.destroy();
    		}
    	}));
    	win.doLayout();
    	win.show();
    }
});
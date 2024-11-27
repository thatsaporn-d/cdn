//v=1

Senate.QNMain = {
    getCmpField: function (fdName, prefix) {
        var fm = Ext.getCmp('main-form');
        if (!prefix) prefix = '';

        var f = fm.getForm();
        return f.findField(prefix + '' + fm.fmID + '-fdName-' + fdName);
    },

    getFieldValue: function (fdName, prefix) {
        var field = this.getCmpField(fdName, prefix);
        if (field) {
            return field.getValue();
        }
        return null;
    },

    createQuestion: function (tqDetail, manualCreate, viewMode) {
        var title = 'None';
        if (tqDetail.title) {
            title = tqDetail.title;
        }
        var qtype = tqDetail.qType;

        var cmbType = new Ext.form.ComboBox({
            fieldLabel: 'Question Type',
            anchor: '50%',
            mode: 'local',
            typeAhead: true,
            triggerAction: 'all',
            name: 'qtype',
            editable: false,
            cls: 'white-field',
            readOnly: viewMode,
            store: new Ext.data.ArrayStore({
                fields: [
                    'id',
                    'name'
                ],
                data: [[1, 'Text'], [2, 'Paragraph text'], [3, 'Multiple choice'], [4, 'Checkboxes'], [6, 'Scale'], [7, 'Grid']]
            }),
            valueField: 'id',
            displayField: 'name',
            listeners: {
                'select': function (cmb) {
                    var qform = cmb.ownerCt.find('ansPanel', true)[0];
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
                                                hidden: viewMode,
                                                handler: function (btn) {
                                                    var size = qform.items.length;
                                                    var index = (btn.ownerCt.other) ? size - 1 : size;
                                                    var pos = (btn.ownerCt.other) ? size - 2 : size - 1;
                                                    qform.insert(pos, qform.createOption(index, 'radio'));
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
                                                handler: function (btn) {
                                                    var index = qform.items.length;
                                                    qform.insert(index - 1, qform.createOther(btn, 'radio'));
                                                    qform.doLayout();

                                                    btn.ownerCt.other = true;
                                                    btn.setDisabled(true);
                                                }
                                            })
                                        ]
                                    }
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
                                                hidden: viewMode,
                                                handler: function (btn) {
                                                    var size = qform.items.length;
                                                    var index = (btn.ownerCt.other) ? size - 1 : size;
                                                    var pos = (btn.ownerCt.other) ? size - 2 : size - 1;
                                                    qform.insert(pos, qform.createOption(index, 'checkbox'));
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
                                                handler: function (btn) {
                                                    var index = qform.items.length;
                                                    qform.insert(index - 1, qform.createOther(btn, 'checkbox'));
                                                    qform.doLayout();

                                                    btn.ownerCt.other = true;
                                                    btn.setDisabled(true);
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
                                        hidden: viewMode,
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
                                            hidden: viewMode,
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
                                            hidden: viewMode,
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
            draggable: !viewMode,
            tools: [{
                id: 'gear',
                hidden: viewMode,
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
                hidden: viewMode,
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
                hidden: viewMode,
                handler: function (btn) {
                    btn.ownerCt.ownerCt.toggleCollapse(false);
                }
            })],
            labelWidth: 120,
            items: [
                new Ext.form.TextField({
                    fieldLabel: 'Question Title',
                    anchor: '100%',
                    value: title,
                    name: 'qname',

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

                    ansPanel: true,

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
                                    hidden: viewMode,
                                    handler: function (btn) {
                                        if (qform.items.length > 2)
                                            qform.remove(comp, true);
                                    }
                                })
                            ]
                        });

                        return comp;

                    },

                    createOther: function (btn, xtype, value) {
                        var qform = this;
                        var comp = new Ext.form.CompositeField({
                            style: 'margin-bottom: 5px',
                            items: [{
                                xtype: xtype,
                                name: qform.id,
                                value: (xtype == 'displayfield') ? index + '. ' : ''
                            },
                                new Ext.form.DisplayField({
                                    value: 'Other:',
                                }),
                                new Ext.form.TextField({
                                    flex: 1,
                                    value: 'their answer',
                                    readOnly: true
                                }),
                                new Ext.Button({
                                    text: 'X',
                                    width: 20,
                                    hidden: viewMode,
                                    handler: function () {
                                        if (qform.items.length > 2)
                                            qform.remove(comp, true);

                                        btn.ownerCt.other = false;
                                        btn.setDisabled(false);
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
                                    hidden: viewMode,
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
                                    readOnly: viewMode,
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
                                    readOnly: viewMode,
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
                }),
                new Ext.form.Checkbox({
                    name: 'require',
                    value: tqDetail.require,
                    checked: tqDetail.require,
                    fieldLabel: 'Required question'
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

    loadQn: function (id, method, mapping, callback) {
        var self = this;
        var form = Ext.getCmp('main-form');
        var col = form.find('name', 'portalColumn')[0];

        show_loading();
        invoke_method({
            method: method,
            params: [
                { type: 1, value: id }
            ]
        },
        function (json) {
            hide_loading();

            if (json.success) {
                var rec = json.data;
                Ext.StoreMgr.add('qnData', rec);

                for (i in mapping) {
                    var f = mapping[i];
                    if (f.split('|').length > 1) {
                        var ff = f.split('|');
                        self.getCmpField(ff[0], ff[1]).setValue(rec[i]);
                    }
                    else {
                        self.getCmpField(f).setValue(rec[i]);
                    }
                }

                if (!rec.QNID)
                    self.loadQnDetail(rec);

                if (typeof callback == 'function') {
                    callback(rec);
                }
            }
            else {
                show_error(json.errMessage, 'Error');
            }
        });
    },

    loadQnDetail: function (rec) {
        var self = this;
        var form = Ext.getCmp('main-form');
        var col = form.find('name', 'portalColumn')[0];
        col.removeAll();

        var dets = rec.details;
        var refColPanel = {};
        if (dets) {
            for (var i = 0; i < dets.length; i++) {
                var tqDetail = dets[i];
                if (tqDetail.qType == 1 || tqDetail.qType == 2) {
                    col.addPortlet(tqDetail);
                }
                else if (tqDetail.qType == 3 || tqDetail.qType == 4 || tqDetail.qType == 5) {
                    var p = col.addPortlet(tqDetail);

                    var op = p.find('ansPanel', true)[0];
                    op.remove(0, true);

                    var xtype = (tqDetail.qType == 3) ? 'radio' : (tqDetail.qType == 4) ? 'checkbox' : 'displayfield';

                    seq = 1;
                    while (i + 1 < dets.length && dets[i + 1].gSeq != null) {
                        if (dets[i + 1].other) {
                            var btn = p.find('text', 'Add Other')[0];
                            btn.setDisabled(true);
                            op.insert(seq - 1, op.createOther(btn, xtype));
                        }
                        else {
                            op.insert(seq - 1, op.createOption(seq, xtype, dets[i + 1].title));
                        }
                        seq++;
                        i++;
                    }

                    op.doLayout();
                }
                else if (tqDetail.qType == 7) {
                    var tmbSeq = tqDetail.seq;
                    var p = col.addPortlet(tqDetail);
                    var op = p.find('ansPanel', true)[0];

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
                    var p = col.addPortlet(tqDetail, true);

                    var op = p.find('ansPanel', true)[0];
                    //op.removeAll();

                    var start = dets[i + 1].title.split(':');
                    var end = dets[i + 2].title.split(':');
                    op.add(op.createScale(start[0], end[0], start[1], end[1]));
                    op.doLayout();

                    i += 2
                }
            }
        }

        var cols = rec.columns;
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
    },

    saveQn: function (mapping, method, callback) {
        var self = this;

        var form = Ext.getCmp('main-form');
        var pID = form.pID;
        if (!pID) {
            pID = -1;
        }

        tqHead = {
            details: [],
            columns: []
        };

        for (i in mapping) {
            var f = mapping[i];
            if (f.split('|').length > 1) {
                var ff = f.split('|');
                tqHead[i] = self.getFieldValue(ff[0], ff[1]);
            }
            else {
                tqHead[i] = self.getFieldValue(f);
            }
        }

        if (!tqHead.QNID) {
            var col = form.find('name', 'portalColumn')[0];

            var seq = 1;
            var colSeq = 1;
            for (var i = 0; i < col.items.length; i++) {
                var p = col.items.get(i);
                var title = p.find('name', 'qname')[0];
                var type = p.find('name', 'qtype')[0];
                var qq = p.find('ansPanel', true)[0];
                var req = p.find('name', 'require')[0];

                var tqDetail = {
                    seq: seq,
                    gSeq: null,
                    title: title.getValue(),
                    qType: type.getValue(),
                    require: req.getValue()
                };
                tqHead.details.push(tqDetail);

                if (tqDetail.qType == 3 || tqDetail.qType == 4 || tqDetail.qType == 5) {
                    for (var j = 0; j < qq.items.length - 1; j++) {
                        var c = qq.items.get(j);
                        var txt = c.items.get(1);

                        var ttl = txt.getValue();
                        if (txt.getXType() == 'displayfield') {
                            ttl = null;
                        }

                        tqDetail = {
                            seq: seq + (j + 1),
                            gSeq: seq,
                            title: ttl,
                            qType: type.getValue()
                        };

                        if (!ttl) {
                            tqDetail.other = true;
                        }

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
        }
        else {
            var list = form.find('name', 'qnItems')[0];
            var ansArr = new Array();
            for (var i = 0; i < list.items.length; i++) {
                var fs = list.items.get(i);
                if (fs.qtype) {
                    var required = fs.IsRequired;
                    var qnum = fs.title.replace(/<span.*span>/i, '').trim();
                    //qseq, qgseq, qanswertext
                    switch (fs.qtype) {
                        case 1:
                            {
                                var txtField = fs.items.get(0).items.get(1);
                                var val = txtField.getValue();
                                if (required && !val) {
                                    show_error(qnum + ' is required');
                                    return;
                                }
                                if (val && val.trim().length > 0) {
                                    var ans = {
                                        qseq: txtField.seq,
                                        qanswertext: val
                                    };
                                    ansArr.push(ans);
                                }
                                break;
                            }
                        case 2:
                            {
                                var txtField = fs.items.get(0).items.get(1);
                                var val = txtField.getValue();
                                if (required && !val) {
                                    show_error(qnum + ' is required');
                                    return;
                                }
                                if (val && val.trim().length > 0) {
                                    var ans = {
                                        qseq: txtField.seq,
                                        qanswertext: val
                                    };
                                    ansArr.push(ans);
                                }
                                break;
                            }
                        case 3:
                            {
                                var options = fs.items.get(0).items.get(1);
                                var selected = options.getValue();
                                if (required && !selected.length) {
                                    show_error(qnum + ' is required');
                                    return;
                                }
                                for (var j = 0; j < selected.length; j++) {
                                    var ans = {
                                        qseq: selected[j].seq,
                                        qgseq: selected[j].gseq
                                    };
                                    if (selected[j].other) {
                                        ans.qanswertext = Ext.get(selected[j].other).getValue();
                                    }
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
                                    if (selected.other) {
                                        ans.qanswertext = Ext.get(selected.other).getValue();
                                    }
                                    ansArr.push(ans);
                                }
                                else if (required) {
                                    show_error(qnum + ' is required');
                                    return;
                                }
                                break;
                            }
                        case 6:
                            {
                                var res = fs.items.get(0).items.get(1).items.get(1);
                                var seq = parseInt(res.id.split('-')[1]);
                                var val = (res.getValue()) ? res.getValue().inputValue : null;

                                if (required && !val) {
                                    show_error(qnum + ' is required');
                                    return;
                                }

                                if (res) {
                                    var ans = {
                                        qcol: val,
                                        qseq: seq
                                    };
                                    ansArr.push(ans);
                                }
                                break;
                            }
                        case 7:
                            {
                                var comp = fs.items.get(0).items.get(1);
                                var table = Ext.query('#ans-' + comp.refSeq);
                                var rows = Ext.query('#ans-' + comp.refSeq + ' tr[data-seq]');
                                var checkCount = 0;
                                for (var j = 0; j < rows.length; j++) {
                                    var r = rows[j];
                                    var rads = Ext.query('#ans-' + comp.refSeq + ' [name=rad-' + comp.refSeq + '-' + rows[j].dataset.seq + ']');
                                    var val = 0;
                                    for (var k = 0; k < rads.length; k++) {
                                        if (rads[k].checked) {
                                            val = parseInt(rads[k].value);
                                            checkCount++;
                                            break;
                                        }
                                    }

                                    var ans = {
                                        qseq: rows[j].dataset.seq,
                                        qcol: val,
                                        qgseq: comp.refSeq
                                    };
                                    ansArr.push(ans);
                                }

                                if (required && checkCount < rows.length) {
                                    show_error(qnum + ' is required');
                                    return;
                                }

                                break;
                            }
                    }
                }
            }
            tqHead.Data = ansArr;
        }

        show_loading();
        invoke_method({
            method: method,
            params: [
                { type: 1, value: pID },
                { type: 1, value: Senate.user.userId },
                { type: 2, value: Ext.util.JSON.encode(tqHead) }
            ]
        },
            function (json) {

                if (json.success) {
                    if (typeof callback == 'function') {
                        callback(json.data, form);
                    }
                    else {
                        hide_loading();
                        show_info('Your data has been successfully saved', 'Message', function () {
                            var parent = form.parentPage;
                        
                            parent.removeAll();
                            parent.add(new Senate.MainForm({
                                pID: json.data,
                                fmID: form.fmID,
                                refFm: form.refFm,
                                parentPage: parent,
                                mainBody: form.mainBody,
                                currentTab: form.currentTab,
                                formMode: 'editFrm'
                            }));
                            parent.doLayout();
                        });
                    }
                }
                else {
                    show_error(json.errMessage, 'Error');
                }
            }
        );
    },

    renderLayout: function (opts) {
        var self = this;

        var bd = Ext.getCmp('body-panel');
        var fm = Ext.getCmp('main-form');
        var viewMode = fm.viewMode;

        var col = new Ext.ux.PortalColumn({
            style: 'padding: 10px 5px 0 5px;',
            defaults: { bodyStyle: 'padding: 5px;' },
            columnWidth: 1,

            name: 'portalColumn',

            addPortlet: function (tqDetail, manualCreate) {
                if (col.items && !viewMode) {
                    for (var i = 0; i < col.items.length; i++) {
                        var p = col.items.get(i);
                        if (!p.collapsed) {
                            p.toggleCollapse(false);
                        }
                    }
                }

                var portlet = self.createQuestion(tqDetail, manualCreate, viewMode);
                col.add(portlet);
                col.doLayout();

                return portlet;
            }
        });

        var portal = new Ext.ux.Portal({
            columnWidth: 1,
            title: 'Question List',
            bodyStyle: 'border: solid 1px #CCC; background-color: #FAFAFA',
            tbar: new Ext.Toolbar({
                items: [
                    new Ext.Button({
                        text: 'Add Question',
                        hidden: viewMode,
                        menu: new Ext.menu.Menu({
                            items: [{
                                text: 'Text',
                                handler: function (btn) {
                                    col.addPortlet({ qType: 1 });
                                }
                            }, {
                                text: 'Paragraph text',
                                handler: function (btn) {
                                    col.addPortlet({ qType: 2 });
                                }
                            }, {
                                text: 'Multiple choice',
                                handler: function (btn) {
                                    col.addPortlet({ qType: 3 });
                                }
                            }, {
                                text: 'Checkboxes',
                                handler: function (btn) {
                                    col.addPortlet({ qType: 4 });
                                }
                            }, {
                                text: 'Scale',
                                handler: function (btn) {
                                    col.addPortlet({ qType: 6 });
                                }
                            }, {
                                text: 'Grid',
                                handler: function (btn) {
                                    col.addPortlet({ qType: 7 });
                                }
                            }]
                        })
                    })
                ]
            }),
            items: [
                col
            ]
        });

        var detailPanel = new Ext.Panel({
            layout: 'column',
            border: false,
            defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
            items: portal
        });

        fm.add(detailPanel);

        var btnSave = new Ext.Button({
            text: 'Save',
            handler: function () {
                opts.onSave();
            }
        });

        bd.getTopToolbar().insert(bd.getTopToolbar().items.length - 2, btnSave);

        if (typeof opts.onSubmit == 'function') {
            var btnSubmit = new Ext.Button({
                text: 'Submit',
                handler: function () {
                    opts.onSubmit();
                }
            });

            bd.getTopToolbar().insert(bd.getTopToolbar().items.length - 2, btnSubmit);
        }

        if (fm.pID) {
            var btnPreview = new Ext.Button({
                text: 'Preview',
                handler: function () {
                    var h = 500;
                    var w = 800;
                    var left = (screen.width / 2) - (w / 2);
                    var top = (screen.height / 2) - (h / 2);
                    window.open("PreviewQN.aspx", "Preview", "titlebar=no,statusbar=no,menubar=no,resizable=no,scrollbars=yes,width=" + w + ",height=" + h + ",top=" + top + ",left=" + left);
                }
            });
            bd.getTopToolbar().insert(bd.getTopToolbar().items.length - 2, btnPreview);

            if (opts.summary) {
                var btnSummary = new Ext.Button({
                    text: 'Summary',
                    handler: function () {
                        show_loading();
                        invoke_method({
                            method: 'getQNSummary',
                            params: [
                                { type: 1, value: fm.pID }
                            ]
                        }, function (json) {
                            var data = Ext.StoreMgr.get('qnData');
                            data.details = json.data;
                            Ext.StoreMgr.add('sumData', data);

                            var h = 500;
                            var w = 800;
                            var left = (screen.width / 2) - (w / 2);
                            var top = (screen.height / 2) - (h / 2);
                            window.open("PrintQN.aspx", "Preview", "titlebar=no,statusbar=no,menubar=no,resizable=no,scrollbars=yes,width=" + w + ",height=" + h + ",top=" + top + ",left=" + left);
                        });
                    }
                });
                bd.getTopToolbar().insert(bd.getTopToolbar().items.length - 2, btnSummary);
            }

            var onLoad = opts.onLoad;
            self.loadQn(fm.pID, onLoad.method, onLoad.mapping);
        }
        bd.doLayout();
    }
};

Senate.QNTemplate = {
    init: function () {
        var self = Senate.QNMain;

        var fieldMapping = {
            qName: 'template_name',
            qDesc: 'template_desc',
            inactive: 'inactive|chk-',
        };

        self.renderLayout({
            onLoad: {
                method: 'loadQNTemplate',
                mapping: fieldMapping
            },
            onSave: function () {
                self.saveQn(fieldMapping, 'saveQNTemplate');
            },
            viewMode: false
        });
    },

    loadTemplate: function (tmpId) {
        var self = Senate.QNMain;

        show_loading();
        invoke_method({
            method: 'getQNTemplateDetail',
            params: [
                { type: 1, value: tmpId }
            ]
        }, function (json) {
            hide_loading();

            self.loadQnDetail(json.data)
        });
    }
};

Senate.QNForm = {
    init: function () {
        var self = Senate.QNMain;

        var fieldMapping = {
            qName: 'subject',
            qDesc: 'desc',
            docDate: 'qdate',
            docNo: 'qno',
            startDate: 'sdate',
            endDate: 'edate',
            endDate: 'edate',
            refActID: 'ref_activity_id',
            actName: 'activity_name',
            actNo: 'activity_no'
        };

        self.renderLayout({
            onLoad: {
                method: 'loadQNForm',
                mapping: fieldMapping
            },
            onSave: function () {
                self.saveQn(fieldMapping, 'saveQNForm');
            },
            onSubmit: function () {
                self.saveQn(fieldMapping, 'saveQNForm', function (key, form) {
                    var sp = '{"spName":"up_DF_LinkDocToDF","spReturn":null,"spIn":"@DocType, @DocID, @USID, @FMID, @WSID","spOut":null}';
                    
                    Ext.Ajax.request({
                        url: Senate.url.Form,
                        method: 'POST',
                        params: { 
                            QueryType: 99, 
                            SP: sp, keyValue: key, DocType: 26001,
                            FMID: form.fmID, PK: 'tQN_Head|DocID'
                        },
                        success: function (result) {
                            hide_loading();
                            var json = Ext.util.JSON.decode(result.responseText);
                            if (json.success) {            
                                hide_loading();

                                var parent = form.parentPage;

                                Ext.Msg.show({
                                    title: 'Success',
                                    msg: 'Your data has been successfully submitted',
                                    icon: Ext.Msg.INFO,
                                    buttons: Ext.Msg.OK,
                                    fn: function () {
                                        parent.removeAll();
                                        parent.add(new Senate.MainForm({
                                            fmID: form.refFm,
                                            parentPage: parent,
                                            mainBody: form.mainBody
                                        }));
                                        parent.doLayout();
                                    }
                                });
                            }
                            else {
                                show_error(json.errMessage);
                            }

                        },
                        failure: function () {
                            hide_loading();
                            show_error('Error, cannot call store procedure');
                        }
                    });
                });
            },
            summary: true,
            viewMode: false
        });
    }
};

Senate.QNAns = {
    init: function () {
        var _this = this;
        var self = Senate.QNMain;

        var fieldMapping = {
            DocNo: 'qanswerno',
            DocDate: 'qanswerdate',
            QNID: 'qnid',
            QNNo: 'qnno',
            CTID: 'ctid',
            CTName: 'company_name',
            CTCode: 'company_code',

            CTID_Person: 'ctid_person',
            PersonName: 'person_name',
            PersonCode: 'ref_person_code',

            SDate: 'sdate',
            EDate: 'edate',
            AnsDate: 'ans_date',
            ActName: 'ref_activity_name',
            ActNo: 'ref_activity_no',
            RefActivityID: 'ref_activity_id',
            Subject: 'subject',
            Description: 'desc'
        };

        var bd = Ext.getCmp('body-panel');
        var fm = Ext.getCmp('main-form');

        if (fm.pID) {
            self.loadQn(fm.pID, 'loadQNAns', fieldMapping, function (rec) {
                _this.renderAnsForm(rec.QNID, rec.Data);
            });
        }

        var boxPanel = new Ext.Panel({
            title: 'Question List',
            ansPanel: true,
            hidden: true,
            bodyStyle: 'border: solid 1px #CCC; background-color: #FAFAFA'
        });
        fm.items.add(boxPanel);

        var btnSave = new Ext.Button({
            text: 'Save',
            handler: function () {
                self.saveQn(fieldMapping, 'saveQNAns');
            }
        });
        var btnPreview = new Ext.Button({
            text: 'Preview',
            handler: function () {
                var h = 500;
                var w = 800;
                var left = (screen.width / 2) - (w / 2);
                var top = (screen.height / 2) - (h / 2);
                window.open("PrintQN.aspx", "Preview", "titlebar=no,statusbar=no,menubar=no,resizable=no,scrollbars=yes,width=" + w + ",height=" + h + ",top=" + top + ",left=" + left);
            }
        });

        bd.getTopToolbar().insert(bd.getTopToolbar().items.length - 2, btnSave);
        bd.doLayout();

        if (fm.pID) {
            bd.doLayout();
            bd.getTopToolbar().insert(bd.getTopToolbar().items.length - 2, btnPreview);
        }
    },

    renderAnsForm: function (docId, ansData) {
        var self = this;

        var fm = Ext.getCmp('main-form');
        var boxPanel = fm.find('ansPanel', true)[0];
        boxPanel.show();

        invoke_method({
            method: 'loadQNForm',
            params: [
                { type: 1, value: docId }
            ]
        },
        function (json) {
            if (json.success) {
                var qPanel = self.createQN(json.data, fm.viewMode);

                boxPanel.removeAll();
                boxPanel.add(qPanel);
                boxPanel.doLayout();

                if (ansData) {
                    var detail = ansData;

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

                                if (det.qanswertext) {
                                    Ext.get('other-' + det.qseq + '-' + det.qgseq).dom.value = det.qanswertext;
                                }
                            }
                            else if (cmp.getXType() == 'radiogroup') {
                                if (cmp.columns == 1) {
                                    cmp.setValue('opt-' + det.qseq + '-' + det.qgseq, true);
                                }
                                else {
                                    cmp.setValue(det.qcol);
                                }

                                if (det.qanswertext) {
                                    Ext.get('other-' + det.qseq + '-' + det.qgseq).dom.value = det.qanswertext;
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

                            rowIndex = det.qseq; 
                            var rad = Ext.query('#ans-' + det.qgseq + ' [name=rad-' + det.qgseq + '-' + rowIndex + '][value=' + det.qcol + ']')[0];
                            if (rad) {
                                rad.checked = true;
                                rowIndex++;
                            }
                        }
                    }
                }
            }
        });
    },

    createQN: function (data, viewMode) {
        var qnList = new Ext.Panel({
            border: false,
            columnWidth: 1,
            layout: 'form',
            name: 'qnItems',

            items: []
        });
        var qPanel = new Ext.Panel({
            layout: 'column',
            border: false,
            defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
            items: qnList
        });

        var qnum = 0;

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
                        var other = data.details[index].other;
                        var otherId = 'other-' + data.details[index].seq + '-' + data.details[index].gSeq;

                        options.push({
                            disabled: viewMode,
                            boxLabel: (!other) ? data.details[index].title : 'Other: <input id="' + otherId + '" class="ext-strict x-form-text" type="text" />',
                            id: 'opt-' + data.details[index].seq + '-' + data.details[index].gSeq,
                            name: 'opt-' + seq + '-' + data.details[index].gSeq,
                            seq: data.details[index].seq,
                            gseq: data.details[index].gSeq,
                            other: (other) ? otherId : null
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
                        var other = data.details[index].other;
                        var otherId = 'other-' + data.details[index].seq + '-' + data.details[index].gSeq;

                        options.push({
                            disabled: viewMode,
                            boxLabel: (!other) ? data.details[index].title : 'Other: <input id="' + otherId + '" class="ext-strict x-form-text" type="text" />',
                            id: 'opt-' + data.details[index].seq + '-' + data.details[index].gSeq,
                            name: 'opt-' + seq + '-' + data.details[index].gSeq,
                            seq: data.details[index].seq,
                            gseq: data.details[index].gSeq,
                            other: (other)? otherId: null
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

                        var start = data.details[i + 1];
                        var startTag = start.title.split(':');
                        var min = parseInt(startTag[0]);

                        var end = data.details[i + 2];
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
                        var tr = '<tr data-seq="' + rows[j].seq + '" style="height: 20px;">';
                        tr += '<td>' + rows[j].title + '</td>';
                        for (var k = 0; k < cols.length; k++) {
                            tr += '<td style="text-align: center;"><input type="radio" name="rad-' + seq + '-' + rows[j].seq + '" value="' + cols[k].seq + '"/></td>';
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
                title: 'Question ' + qnum + ((qq.require)?' <span style="color: red;">*</span>': ''),
                collapsed: false,
                qtype: qq.qType,
                collapsible: true,
                autoHeight: true,
                IsRequired: qq.require,
                QTitle: qq.title,
                items: items
            });

            qnList.add(fs);
        }

        return qPanel;
    }
};
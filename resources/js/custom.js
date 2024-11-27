Senate.ffm.User = 500011;
Senate.ffm.UserGroup = 500010;

function loadCustom(fmID, pID, panel, body) {
	var valid = false;
	var func = null;
	var act = null;
	
	body.showLoading();
	
	fmID = parseInt(fmID);
	
	switch (fmID) {
		case Senate.ffm.User: {		
			func = 'load-user';
			break;
		}
		case Senate.ffm.UserGroup: {
			func = 'load-user-group';
			break;
		}
	}
	
	Ext.Ajax.request({
		url: 'json/Custom.aspx',
		method: 'POST',
		params: { act: func, pk: pID },
		success: function(response) {
			var json = Ext.util.JSON.decode(response.responseText);
			
			if (!json.success) {
				showError(json.errMessage);
			}			
			else {
				var data = json.data;
				
				var items = [];
				var grid = null;
				
				switch (fmID) {
					case Senate.ffm.User: {		
						act = 'update-user';
						items = manageUser(data, json.items, fmID, pID, panel, body);
						break;
					}
					case Senate.ffm.UserGroup: {	
						act = 'update-user-group';
						items = manageUserGroup(data, json.items, fmID, pID, panel, body);
						break;
					}
				}
				
				panel.add(items);
				panel.doLayout();
				
				body.hideLoading();
				
				if (act != null) {	
					var form = panel.getForm();
					
					var btnSave = new Ext.Button({
						text: 'Save',
						handler: function() {
							var grid = null;
							if (!panel.isOwner) {
								grid = Ext.getCmp('main-grid');
							}
							submitForm(panel, act, fmID, pID, grid);
						}
					});
					body.getTopToolbar().add(btnSave);
					
					var btnBack = new Ext.Button({
						text: 'Back',
						handler: function() {
    	                    var refFm = panel.refFm;
    	                    var parent = panel.parentPage;
						    
							parent.removeAll();
	            		    parent.add(new Senate.MainForm({
				    		    fmID: refFm,
				    		    parentPage: parent,
				    		    mainBody: body
				    	    }));
	            		    parent.doLayout();
						}
					});
					body.getTopToolbar().add(btnBack);
					body.getTopToolbar().doLayout();
				}
			}
		}
	});
}

function manageUser(data, items, fmID, pID, panel, body) {
	if (data == null) {
		data = new Array(8);
	}

    var signaturePath = data[3];

	var wsId = data[6];
	
	var grid = new Ext.grid.GridPanel({
		id: 'main-grid',
		autoHeight: true,
		store: new Ext.data.ArrayStore({
			fields: [
				{ name: 'ugid' }, 
				{ name: 'ugname' }, 
				{ name: 'checked' }
			],
			autoLoad: true,
			data: items
		}),
		selModel: new Ext.grid.RowSelectionModel({ 
	    	singleSelect: true
		}),
		colModel: new Ext.grid.ColumnModel([
			{ 
				header: 'ugid', 
				dataIndex: 'ugid',
				width: 10,
				hidden: true
			}, { 
				header: 'User Group', 
				dataIndex: 'ugname',
				width: 90
			}, { 
				header: 'Active', 
				dataIndex: 'checked',
				xtype: 'checkcolumn',
				width: 10,
				align: 'center'
			}
		]),
		viewConfig: { forceFit: true }
	});

	var items = [
        new Ext.Panel({
            layout: 'form',
            border: false,
            html: '<img src="resources/css/images/pixel.gif" />',

            items: [
				new Ext.ux.form.FileUploadField({
				    //buttonOnly: true,
				    fieldLabel: 'Signature Image',
				    buttonText: 'Browse',
				    width: 220,
				    listeners: {
				        'fileselected': function (fb, v) {
				            var f = Ext.getCmp('main-form').getForm();
				            f.fileUpload = true;

				            f.submit({
				                clientValidation: false,
				                method: 'POST',
				                url: Senate.url.Upload,
				                success: function (f, result) {
				                    fb.reset();
				                    f.fileUpload = false;

				                    var data = result.result;
				                    if (data.success) {
				                        var items = data.items[0];

				                        var url = Senate.url.Download + '?name=' + items.fileName + '&path=' + items.filePath;

				                        Ext.getCmp('signature-box').update('<img src="' + url + '" />');
				                        Ext.getCmp('signature-hid').setValue(items.filePath);
				                    }
				                }
				            });


				            //		            	    var fp = panel;		            	
				            //		            	
				            //		            	    fp.getForm().fileUpload = true;
				            //		            	    fp.getForm().submit({
				            //		            	        clientValidation: false,
				            //							    method: 'POST',
				            //		                        url: Senate.url.Upload,
				            //		                        success: function(f, result) {
				            //		                    	    fb.reset();
				            //		                            fp.getForm().fileUpload = false;
				            //		                        
				            //		                            var data = result.result;
				            //	                    		    if (data.success) {
				            //	                    			    var items = data.items[0];

				            //	                    			    comp.updateFile(items.fileName, items.filePath, items.fileSize);
				            //	                    			
				            //	        		            	    if (panel.isWindow) {
				            //	        		            		    fp = Ext.getCmp('main-form');
				            //	        		            		    fp.hiddenFiles[upFile.attachFile + '-' + fp.currentRow] = items.sysName;
				            //	        		            	    }
				            //	        		            	    else {
				            //	        		            		    fp.hiddenFiles[upFile.attachFile] = items.sysName;
				            //	        		            	    }
				            //	                    		    } 
				            //		                        }
				            //		                    });
				        }
				    }
				}),
                new Ext.Panel({
                    id: 'signature-box',
                    style: 'margin-bottom: 10px',
                    html: (signaturePath) ? '<img src="' + Senate.fileDir + signaturePath + '"/>' : ''
                }),
                new Ext.form.Hidden({
                    id: 'signature-hid',
                    name: 'signature',
                    value: signaturePath
                })
			]
        }),
		new Ext.Panel({
		    columnWidth: 1,
		    layout: 'fit',
		    border: false,
		    hidden: panel.isOwner,
		    html: '<img src="resources/css/images/pixel.gif" />',
		    items: [
                grid
            ]
		})
	];
	
	return items;
}

function manageUserGroup(data, items, fmID, pID, panel, body) {
	if (data == null) {
		data = new Array(4);
	}
	
	var wsId = data[2];
	var ctId = data[3];
	
	var grid = new Ext.grid.GridPanel({
		id: 'main-grid',
		perm: true,
		autoHeight: true,
		store: new Ext.data.ArrayStore({
			fields: [
				//Seq, MPID, PMPID, FMID, FCID, Description, PBit
				{ name: 'Seq' }, 
				{ name: 'MPID' }, 
				{ name: 'PMPID' }, 
				{ name: 'FMID' }, 
				{ name: 'FCID' }, 
				{ name: 'Description' }, 
				{ name: 'PBit' }
			],
			autoLoad: true,
			data: items
		}),
		selModel: new Ext.grid.RowSelectionModel({ 
	    	singleSelect: true
		}),
		colModel: new Ext.grid.ColumnModel([
			{ header: 'Seq', dataIndex: 'Seq', hidden: true },
			{ header: 'MPID', dataIndex: 'MPID', hidden: true },
			{ header: 'PMPID', dataIndex: 'PMPID', hidden: true },
			{ header: 'FMID', dataIndex: 'FMID', hidden: true },
			{ header: 'FCID', dataIndex: 'FCID', hidden: true },
			{ header: 'Description', dataIndex: 'Description', renderer: createCheckbox },
			{ header: 'PBit', dataIndex: 'PBit', hidden: true }
		]),
		viewConfig: { forceFit: true }
	});
	
	return [
		new Ext.Panel({    	
			columnWidth: 1, 
			layout: 'form',
			border: false,
			html: '<img src="resources/css/images/pixel.gif" />',
			
			items: [
				new Ext.form.FieldSet({
					title: 'Group Setting',
					collapsible: true,
	        		autoHeight: true,
	        		items: [
	        			new Ext.form.TextField({
							name: 'ugname',
							fieldLabel: '<b style="color: #3B5998">' + 'ชื่อกลุ่ม' + '</b>',
							allowBlank: false,
							value: data[0],
							anchor: '100%'
						}),
						new Ext.form.Checkbox({
							name: 'inactive',
							fieldLabel: 'ยกเลิก',
							anchor: '100%',
							checked: data[1]
						})
	        		] 
				})
			]
		}),
		new Ext.Panel({    	
			columnWidth: 1, 
			layout: 'fit',
			border: false,
			hidden: panel.isOwner,
			html: '<img src="resources/css/images/pixel.gif" />',
			items: grid
		})
	];
}

function loadUserGroup(grid, wsId, ctId, pID) {
	Ext.Ajax.request({
		url: 'json/Custom.aspx',
		method: 'POST',
		params: { act: 'load-user-detail', ws: wsId, ct: ctId, pk: pID },
		success: function(response) {
			var json = Ext.util.JSON.decode(response.responseText);
			grid.store.loadData(json.items);
		}
	});
}

function loadUserPermission(grid, wsId, ctId, pID) {
	Ext.Ajax.request({
		url: 'json/Custom.aspx',
		method: 'POST',
		params: { act: 'load-user-group-detail', ws: wsId, ct: ctId, pk: pID },
		success: function(response) {
			var json = Ext.util.JSON.decode(response.responseText);
			grid.store.loadData(json.items);
		}
	});
}

function submitForm(panel, act, fmID, pID, grid) {
	var det = '';
	if (grid != undefined) {
		var dtJson = [];
		if (grid.getStore().getCount() > 0) {
			if (grid.perm) {
				var store = grid.getStore();
				var data = [];
				for (var j = 0; j < store.getCount(); j++) {
					var rec = store.getAt(j);
					var rows = [];
					
					var cm = grid.getColumnModel();
					for (var k = 0; k < cm.getColumnCount() - 1; k++) {
						rows.push(rec.get(cm.getDataIndex(k)));
					}
					
					var seq = rec.get('MPID');	
					var pseq = rec.get('PMPID');
					var chkKey = 'chk-' + seq + '-';
					if (pseq == null) {
						chkKey += '0';
					}
					else {
						chkKey += pseq;
					}
					
					var chk = document.getElementById(chkKey);
					rows.push(chk.checked);					
					
					data.push(rows);
				}
				det = Ext.util.JSON.encode(data);
			}
			else {
				var store = grid.getStore();
				var data = [];
				for (var j = 0; j < store.getCount(); j++) {
					var rec = store.getAt(j);
					var rows = [];
					
					var cm = grid.getColumnModel();
					for (var k = 0; k < cm.getColumnCount(); k++) {
						rows.push(rec.get(cm.getDataIndex(k)));
					}
					data.push(rows);
				}
				det = Ext.util.JSON.encode(data);
			}
		}
	}
	
	panel.getForm().submit({
    	url: 'json/Custom.aspx',
    	method: 'POST',
    	params: { act: act, pk: pID, det: det },						                    	
    	success: function(form, result) {
    		if (result.result.success) {
    			pID = result.result.data;
    			
        		Ext.Msg.show({
	                title: 'Success',
	                msg: 'Your data has been saved successful',
	                icon: Ext.Msg.INFO,
	                buttons: Ext.Msg.OK,
	                fn: function() {
	                	if (panel.isOwner) {
	                		newForm(undefined, fmID, pID);
	                	}
	                	else {
	                		newForm(panel.mainBody, fmID, pID);
	                	}
	                }
	            });
    		}
    		else {
    			showError(result.result.errMessage);
    		}
    	},
    	failure: function(form, result) {
    		showError(result.result.errMessage, 'Cannot be saved');
    	}
    });
}

function newForm(body, fmID, pID) {
	var isOwner = false;
	if (body == undefined) {
		body = Ext.getCmp('body-panel');
		isOwner = true;
	}
	
	body.removeAll();							
	body.add(new Senate.MainForm({
		fmID: fmID,
		pID: pID,
		mainBody: body,
		isOwner: isOwner
//		selWs: Ext.getCmp('ws-cmb').getValue(),
//		selCt: Ext.getCmp('ct-cmb').getValue()
	}));
	body.doLayout();
}

var pmArr = new Array();

function contains(a, obj) {
	for (var i = 0; i < a.length; i++) {
		if (a[i] === obj){
			return true;
		}
	}
	return false;
}

function permCheck(pseq, chk) {
	if (pseq > 0) {
		var chkList = document.getElementsByName('permList');
		for (var i = 0; i < chkList.length; i++) {
			var seq = chkList[i].id.split('-')[1];
			if (seq == pseq && chk.value == 'on') {
				chkList[i].checked = true;
				permCheck(chkList[i].id.split('-')[2], chkList[i]);
			}
		}
	}
}

function topCheck(seq, chk) {
	var chkList = document.getElementsByName('permList');
	for (var i = 0; i < chkList.length; i++) {
		var pseq = chkList[i].id.split('-')[2];
		if (seq == pseq && chk.value != 'on') {
			chkList[i].checked = false;
			topCheck(chkList[i].id.split('-')[1], chkList[i]);
		}
	}
}

function createCheckbox(value, metaData, record) {
	value = '<span style="padding-left: 5px">' + value + '</span>';
	
	var seq = record.get('MPID');	
	var pseq = record.get('PMPID');
	var chkKey = 'chk-' + seq + '-';
	if (pseq == null) {
		chkKey += '0';
	}
	else {
		chkKey += pseq;
	}
	
	var checked = record.get('PBit');
	var chkStatus = '';
	if (checked) {
		chkStatus = 'checked="checked"';
	}
	
	if (pseq == null) {
		pmArr.push(seq);
		return '<input name="permList" id="' + chkKey + '" onclick="topCheck(' + seq + ', this);" type="checkbox" ' + chkStatus +' /><label style="font-weight: bold" for="' + chkKey + '">' + value + '</label>';
	}
	else if (contains(pmArr, pseq)) {
		return '<span style="padding-left: 100px;"><input name="permList" id="' + chkKey + '" onclick="topCheck(' + seq + ', this);permCheck(' + pseq + ', this);" type="checkbox" ' + chkStatus +' /></span><label for="' + chkKey + '">' + value + '</label>';
	}
	else {
		return '<span style="padding-left: 200px;"><input name="permList" id="' + chkKey + '" onclick="topCheck(' + seq + ', this);permCheck(' + pseq + ', this);" type="checkbox" ' + chkStatus +' /></span><label for="' + chkKey + '">' + value + '</label>';
	}
}
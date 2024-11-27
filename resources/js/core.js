var DateDiff = { 
    days: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
 
        return parseInt((t2-t1)/(24*3600*1000));
    },
    weeks: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
 
        return parseInt((t2-t1)/(24*3600*1000*7));
    }, 
    months: function(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();
 
        return (d2M+12*d2Y)-(d1M+12*d1Y);
    }, 
    years: function(d1, d2) {
        return d2.getFullYear()-d1.getFullYear();
    }
};

function call_sp(cmd, callback) {
	show_loading();
	try {
		var spName = cmd.spName;		
		var params = undefined;	
		var outParams = undefined;
		if (cmd.params) params = Ext.util.JSON.encode(cmd.params);
		if (cmd.outParams) outParams = Ext.util.JSON.encode(cmd.outParams);

		Ext.Ajax.request({
		    url: Senate.url.Core,
		    method: 'POST',
		    params: { act: 'call_sp', spName: spName, params: params, outParams: outParams, db: cmd.db, map: cmd.map },
		    loading: cmd.loading,
		    success: function (result, r) {
		        //					var json = Ext.util.JSON.decode(result.responseText);
		        //					if (callback) {
		        //						callback(json);
		        //					}		
		        if (r.loading != false) {
		            hide_loading();
		        }

		        var json = Ext.util.JSON.decode(result.responseText);
                if (json.success) {
		            if (callback) {
		                callback(json.data, cmd.refData);
		            }
		        }
		        else {
		            show_error(json.errMessage);
		        }
		    }
		});
	}
	catch (e) {
		show_error(e, 'call_sp', hide_loading());
	}
}

function invoke_method(cmd, callback) {
	show_loading();
	try {
		var method = cmd.method;
		var params = undefined;
		if (cmd.params) params = Ext.util.JSON.encode(cmd.params);
		
	    Ext.Ajax.request({
		    url: Senate.url.Core,
		    method: 'POST',
		    params: { act: 'invoke_method', method: method, params: params },
		    loading: cmd.loading,
		    success: function (result, r) {
		        if (r.loading != false) {
		            hide_loading();
		        }
		        var json = Ext.util.JSON.decode(result.responseText);
		        if (callback) {
					callback(json);
				}
		    }
		});
	}
	catch (e) {
		show_error(e, 'invoke_method', hide_loading());
	}
}

function load_grid(fdGrid, cmd, callback) {
	show_loading();
	try {
		var sql = cmd.sql;
		var params = undefined;
		if (cmd.params) params = Ext.util.JSON.encode(cmd.params);
		
		var grid = Ext.getCmp('grid-' + fdGrid);
		
		var cm = grid.getColumnModel();
	    var sel = '';
	    for (var i = 0; i < cm.getColumnCount(); i++) {
	        var col = cm.getDataIndex(i);
	        if (col) {
	            sel += col + ',';
	        }
	    }
	    if (sel.length > 0) sel = sel.substring(0, sel.length - 1);
	    sql = 'select ' + sel + ' from (' + sql + ') dd';
	    
	    Ext.Ajax.request({
		    url: Senate.url.Core,
		    method: 'POST',
		    params: { act: 'load_data', sql: sql, params: params },
		    success: function(result) {
		        var json = Ext.util.JSON.decode(result.responseText);
		        if (json.success) {
					var res = json.data;
					grid.getStore().loadData(res);
				}
				if (callback) {
					callback(json);
				}
				hide_loading();
		    }
		});
	}
	catch (e) {
		show_error(e, 'Internal Error', hide_loading());
	}
}

function load_data(cmd, callback) {
	show_loading();
	try {
		var sql = cmd.sql;
		var params = undefined;
		if (cmd.params) params = Ext.util.JSON.encode(cmd.params);
		var tbID = undefined;
		var rtype = cmd.rtype;
		if (cmd.tbID) tbID = cmd.tbID;
		
	    Ext.Ajax.request({
		    url: Senate.url.Core,
		    method: 'POST',
		    params: { act: 'load_data', sql: sql, params: params, tbID: tbID, rtype: rtype },
		    loading: cmd.loading,
		    success: function(result, r) {
		        if (r.loading != false) {
		            hide_loading();
		        }
				
		        var json = Ext.util.JSON.decode(result.responseText);
		        if (json.success) {
		        	if (callback) {
						callback(json.data);
					}
		        }
		        else {
		        	show_error(json.errMessage);
		        }
		    }
		});
	}
	catch (e) {
		show_error(e, 'load_data', hide_loading());
	}
}

function clear_store(fdName) {
//	var field = get_field(fdName);
//	if (field && field.getStore()) {
//		field.setValue(null);
//		var store = field.getStore();
//		if (store.arrStore) {
//			store.loadData([]);
//		}
//	}
}

function custom_grid(fdGrid, sql) {
    var grid = get_grid(fdGrid);
    var store = grid.getStore();
    store.setBaseParam('temp', store.baseParams.tbID);
    store.setBaseParam('tbID', -1);
    store.setBaseParam('sql', sql);
    store.load();
}

function sum_col(fdGrid, fdCol) {
	var sum = 0;
	
	var grid = get_grid(fdGrid);	
	if (grid) {
		var cm = grid.getColumnModel();
		var col = cm.getColumnById('col-' + fdCol);
		if (col) {
			var store = grid.getStore();
			for (var j = 0; j < store.getCount(); j++) {
				var rec = store.getAt(j);
				var val = rec.get(col.dataIndex);
				if (val) {
					sum += parseFloat(val);
				}
			}
		}	
	}
	
	return sum;
}

function count_rows(fdGrid) {
	var grid = get_grid(fdGrid);	
	if (grid) {
		return grid.getStore().getCount();		
	}
	return 0;
}

function get_keyValue() {	
	var panel = Ext.getCmp('main-form');
    return panel.pID;
}

function get_winFmID() {
	var fid = 'win-form';
	if (Ext.getCmp('zwin-form')) {
		fid = 'zwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'xwin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'swin-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'qwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('filter-form')) {
		fid = 'filter-form';
	} else if (Ext.getCmp('main-form')) {
		fid = 'main-form';
	}
	var panel = Ext.getCmp(fid);
	return panel.fmID;
}

function get_winButtons() {
	var fid = 'win-form';
	if (Ext.getCmp('zwin-form')) {
		fid = 'zwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'xwin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'swin-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'qwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('filter-form')) {
		fid = 'filter-form';
	} else if (Ext.getCmp('main-form')) {
		fid = 'main-form';
	}
	var panel = Ext.getCmp(fid);
	return panel.ownerCt.buttons;
}

function get_winGridName(idx) {
	var fid = 'win-form';
	if (Ext.getCmp('zwin-form')) {
		fid = 'zwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'xwin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'swin-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'qwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('filter-form')) {
		fid = 'filter-form';
	} else if (Ext.getCmp('main-form')) {
		fid = 'main-form';
	}
	var panel = Ext.getCmp(fid);
	var grid = panel.details.length >= 0 ?  panel.details[idx ? idx : 0] : undefined;
	if (grid) {
	    return grid.id.split('-')[1];
	}
	return null;
}

function get_winData() {
	var fid = 'win-form';
	if (Ext.getCmp('zwin-form')) {
		fid = 'zwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'xwin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'swin-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'qwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('filter-form')) {
		fid = 'filter-form';
	} else if (Ext.getCmp('main-form')) {
		fid = 'main-form';
	}
		//winFid = fid,
    return {
		winFid: fid,
        fmID: get_winFmID(),
        btns: get_winButtons(),
        grids: get_winGridName(0)
    };
}

function get_winParent() {
	var fid = 'win-form';
	if (Ext.getCmp('zwin-form')) {
		fid = 'xwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'swin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'main-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'main-form';
	} else {
		fid = 'main-form';
	}
	
	var wp = Ext.getCmp(fid);
    return {
		winFid: fid,
        fmID: wp.fmID,
        btns: wp.ownerCt.buttons,
        grids: wp.details
    };
}

function get_field(fdName, isWindow) {	
    var panel = Ext.getCmp('main-form');
    if (!panel) return;

console.log(panel);
	var key = panel.fmID + '-fdName-' + fdName;

	if (isWindow) {
	var fid = 'win-form';
	if (Ext.getCmp('zwin-form')) {
		fid = 'zwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'xwin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'swin-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'qwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('filter-form')) {
		fid = 'filter-form';
	} else if (Ext.getCmp('main-form')) {
		fid = 'main-form';
	}

	    var winForm = Ext.getCmp(fid);
	    if (!winForm) {
	        winForm = Ext.getCmp('filter-form');

	        if (!winForm && Ext.getCmp('owin-form')) {
	            winForm = Ext.getCmp('owin-form').items.get(0);
	        }
	    }
		
		if(Ext.WindowMgr.getActive()) {
			if (Ext.WindowMgr.getActive().items.length > 0 && winForm.id != Ext.WindowMgr.getActive().items.get(0).id) {
				winForm = Ext.WindowMgr.getActive().items.get(0);
			}
		}

		key = 'w' + winForm.fmID + '-fdName-' + fdName;
	}
	console.log(key);
    var field = Ext.getCmp(key);
	if(!field){
		 var winForm = Ext.getCmp('win-form');
		 if(winForm){
			if (Ext.WindowMgr.getActive()) {
				 if (Ext.WindowMgr.getActive().items.length > 0 && winForm.id != Ext.WindowMgr.getActive().items.get(0).id) {
					winForm = Ext.WindowMgr.getActive().items.get(0);
				 }
			}
			 key = 'w' + winForm.fmID + '-fdName-' + fdName;
			 field = Ext.getCmp(key);
		 }else return null;
	}
	
    if (field) {
        if (field.linkId) {
            return Ext.getCmp(field.linkId);
        }
        else if (field.fdType == Senate.fd.DateBetween) {
            var cmp = Ext.getCmp('comp_' + field.id);
            field.childs = [cmp.items.get(0), cmp.items.get(2)];
        }
        return field;  
    }
    return null;
}

function get_grid(fdGrid, isWindow) {
    var panel = Ext.getCmp('main-form');
	var key = panel.fmID + '-grid-' + fdGrid;
	var fid = 'win-form';
	if (isWindow) {
	if (Ext.getCmp('zwin-form')) {
		fid = 'zwin-form';
	} else if (Ext.getCmp('xwin-form')) {	
		fid = 'xwin-form';
	} else if (Ext.getCmp('swin-form')) {
		fid = 'swin-form';
	} else if (Ext.getCmp('win-form')) {
		fid = 'win-form';
	} else if (Ext.getCmp('qwin-form')) {
		fid = 'qwin-form';
	} else if (Ext.getCmp('pwin-form')) {
		fid = 'pwin-form';
	} else if (Ext.getCmp('owin-form')) {
		fid = 'owin-form';
	} else if (Ext.getCmp('filter-form')) {
		fid = 'filter-form';
	} else if (Ext.getCmp('main-form')) {
		fid = 'main-form';
	}

	    var winForm = Ext.getCmp(fid);
	    if (!winForm) {
	        winForm = Ext.getCmp('filter-form');

	        if (!winForm && Ext.getCmp('owin-form')) {
	            winForm = Ext.getCmp('owin-form').items.get(0);
	        }
	    }
		key = winForm.fmID + '-grid-' + fdGrid;
/*		Backup before check iswindow
	    var winForm = Ext.getCmp('win-form');
	    if (!winForm) {
	        winForm = Ext.getCmp('filter-form');

	        if (!winForm && Ext.getCmp('owin-form')) {
	            winForm = Ext.getCmp('owin-form').items.get(0);
	        }
	    }
		key = winForm.fmID + '-grid-' + fdGrid;*/
    }

	var grid = Ext.getCmp(key);
	if(!grid) {
		 var winForm = Ext.getCmp('win-form');
		 if(winForm){
			 key = winForm.fmID + '-grid-' + fdGrid;
			 grid =  Ext.getCmp(key);
		} else return null;
	}
	
	if (grid) {
		var store = grid.getStore();	
		
		var cm = grid.getColumnModel();
		var columns = new Array();
		for (var i = 0; i < cm.getColumnCount(); i++) {
			columns.push(cm.getDataIndex(i));
		}
		grid['columns'] = columns;
		
		var rows = new Array();
		for (var i = 0; i < store.getCount(); i++) {
			rows.push(store.getAt(i).data);
		}		
		grid['rows'] = rows;	
		
		grid['sumColumn'] = function(dataIndex) {
			var r = this.rows;
			var sum = 0;
			for (var i = 0; i < r.length; i++) {
				var v = r[i][dataIndex]; 
				if (v) {
					sum += parseFloat(v);
				}
			}
			return sum;
		};
		
		grid['countColumn'] = function(dataIndex) {
			var r = this.rows;
			var count = 0;
			for (var i = 0; i < r.length; i++) {
				var v = r[i][dataIndex]; 
				if (v) {
					count++;
				}
			}
			return count;
		};
		
//		grid['selectedRow'] = grid.getSelectionModel().getSelected();
//		grid['selectedRows'] = grid.getSelectionModel().getSelections();
		return grid;									
	}
	return null;
}

function get_keyValue() {
	var panel = Ext.getCmp('main-form');
	if (panel.pID) {
		return panel.pID;
	}
	return null;
}

function get_formMode() {
	var panel = Ext.getCmp('main-form');
	var formMode = panel.formMode;
	if (formMode == 'addFrm') {
		return 1;
	}
	else if (formMode == 'editFrm') {
		return 2;
	}
	else if (formMode == 'viewFrm') {
		return 3;
	}
	else {
		return -1;
	}
}

function get_value(fdName, isWindow) {
    var field = get_field(fdName, isWindow);
    if (field) {
        if (field.fdType == Senate.fd.DateBetween) {
            return [field.childs[0].getValue(), field.childs[1].getValue()];
        }
        return field.getValue();  
    }
    return null;
}

function set_value(fdName, newValue, isWindow) {
    var field = get_field(fdName, isWindow);
    if (field) {
    	if (newValue == null) {
    		newValue = undefined;
    	}
        field.setValue(newValue);

        if (field.refField) {
            field.refField.setValue(newValue);
        }

        field.fireEvent('blur', field);
    }
}

function set_store(fdName, data, isWindow) {
    var cmp = get_field(fdName, isWindow);
    if (!cmp) {
    	cmp = get_grid(fdName, isWindow);
    }
    
    if (cmp) {
    	if (cmp.getXType() == 'combo') {
    		cmp.store = new Ext.data.ArrayStore({
    			refCombo: cmp,
    			
				fields: [
					'itemId',
					'itemName'
				],
				listeners: {
		            'load': function(store) {
		            	if (store.refCombo.getValue()) {
		            		store.refCombo.setValue(store.refCombo.getValue());
		            	}
		            }
		        }
			});
    		cmp.getStore().loadData(data);
    	}
    	else {
		    var store = cmp.getStore();
		    store.removeAll();
		    
		    var Rec = store.recordType;	 
		    for (var i = 0; i < data.length; i++) {
			    store.add(new Rec(data[i]));
	        }
    	}
    }
}

function load_combo(fdName, tbSql, isWindow) {
    var cmb = get_field(fdName, isWindow);

    var cmd = { rtype: 1 };
    if (typeof tbSql == 'number') {
        cmd.tbID = parseInt(tbSql);
    }
    else {
        cmd.sql = tbSql;
    }

    load_data(cmd, function (data) {
        cmb.getStore().loadData({ data: data }); 
		if(data.length == 1 && !cmb.allowBlank) {
			cmb.setValue(cmb.getStore().getAt(0).get(cmb.valueField));
			cmb.fireEvent('select', cmb, cmb.getStore().getAt(0).get(cmb.valueField));
		}
    });
}

function set_enable(fdName, isEnable, isWindow) {
    var field = get_field(fdName, isWindow);
    if (field) {
    	field.setDisabled(!isEnable);
    	
    	if (field.linkId || field.lid) {
    		Ext.getCmp((field.linkId)? field.linkId: field.lid).setDisabled(!isEnable);
    	}
    	
    	if (field.refBtn) {
    		field.refBtn.setDisabled(!isEnable);
    	}

        if (field.fdType == Senate.fd.DateBetween) {
            var cmp = Ext.getCmp('comp_' + field.id);
            cmp.items.get(0).setDisabled(!isEnable);
            cmp.items.get(2).setDisabled(!isEnable);
        }
    }
}

function set_visible(fdName, isVisible, isWindow) {
    var field = get_field(fdName, isWindow);
    if (field) {
    	field.setVisible(isVisible);
		if(field.refInput) {
			if(field.refInput.name != undefined)
				set_visible(field.refInput.name, isVisible, isWindow);
			/*else
				field.refInput.setVisible(isVisible);*/
		}
		
		if (field.linkId || field.lid) {
    		Ext.getCmp((field.linkId)? field.linkId: field.lid).setVisible(isVisible);
    	}
    	
    	if (field.refBtn) {
    		field.refBtn.setVisible(isVisible);
    	}

        if (field.fdType == Senate.fd.DateBetween) {
            var cmp = Ext.getCmp('comp_' + field.id);
            cmp.items.get(0).setVisible(isVisible);
            cmp.items.get(2).setVisible(isVisible);
        }
    }
}

function set_readOnly(fdName, isReadOnly, isWindow) {
    var grid = get_grid(fdName, isWindow);
    if (grid) {
        grid.isReadOnly = isReadOnly;
        (isReadOnly)? grid.getTopToolbar().hide() : grid.getTopToolbar().show();

        var cols = Ext.query('.x-grid3-col-0', grid.el.dom);
        for (var j = 0; j < cols.length; j++) {
            var nodes = cols[j].childNodes;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].attributes['ext:qtip'].value == 'Remove') {
                    nodes[i].style.display = (isReadOnly) ? 'none' : 'inline-block';
                }
            }
        }
        return;
    }

    var field = get_field(fdName, isWindow);
    if (field) {
        if (field.items && field.items.length > 1) {
            field.items.get(1).setDisabled(isReadOnly);
        }
        else if (field.lid) {
            Ext.getCmp(field.lid).items.get(1).setDisabled(isReadOnly);
        }
        else {
            field.setReadOnly(isReadOnly);
        }

        if (field.refInput) {
			if(field.refInput.name != undefined)
				set_readOnly(field.refInput.name, isReadOnly, isWindow);
			/*else
				field.refInput.setReadOnly(isReadOnly);*/
        }
    }
}

function set_params(fdName, params, isWindow) {
	var field = get_field(fdName, isWindow);
	if (field) {
		field.cusParams = params;
	}
}

function get_params(fdName, isWindow) {
	var field = get_field(fdName, isWindow);
	if (field) {
		return field.cusParams;
	}	
}

function to_sqlGrid(fdGrid, sql) {
	var grid = Ext.getCmp('grid-' + fdGrid);
	var cm = grid.getColumnModel();
    var sel = '';
    for (var i = 0; i < cm.getColumnCount(); i++) {
        var col = cm.getDataIndex(i);
        if (col) {
            sel += col + ',';
        }
    }
    if (sel.length > 0) sel = sel.substring(0, sel.length - 1);
    return 'select ' + sel + ' from (' + sql + ') dd';
}

function show_error(msg, title, callback) {
	if (!title) {
		title = 'Error';
	}
	var json = {
        title: title,
        msg: msg,
        icon: Ext.Msg.ERROR,
        buttons: Ext.Msg.OK
    };
    if (callback) {
    	json['fn'] = callback;
    }
	Ext.Msg.show(json);
}

function show_info(msg, title, callback) {
	if (!title) {
		title = 'Information';
	}
	var json = {
        title: title,
        msg: msg,
        width: 350,
        icon: Ext.Msg.INFO,
        buttons: Ext.Msg.OK
    };
    if (callback) {
    	json['fn'] = callback;
    }
	Ext.Msg.show(json);
}

function show_loading(parent) {	
	var body = Ext.getCmp('body-panel');
	if (body) body.showLoading();	
}

function hide_loading(parent) {
	var body = Ext.getCmp('body-panel');
	if (body) body.hideLoading();
}

function mark_invalid(fdName, msg) {
	var field = get_field(fdName);
	if (field) {
		if (!msg) {
			msg = '[Invalid at id: ' + fdName + ']';
		}
		field.markError = msg;
	}
}

function mark_valid(fdName) {
	var field = get_field(fdName);
	if (field) {
		field.markError = undefined;
	}
}

function open_form(fmID) {
	var body = Ext.getCmp('body-panel');
	
	body.removeAll();							
	body.add(new Senate.MainForm({
		fmID: fmID,
		mainBody: body
	}));
	body.doLayout();
}

function open_winForm(fmID, pID, readOnly, callback) {
	var body = Ext.getCmp('body-panel');
			
	var tb = new Ext.Toolbar({
		items: ['->']
    });

    var frmJson = {
	    id: 'form-' + fmID,
	    fmID: fmID,
	    mainBody: body,
	    //srcParams: 'CTID:534',
	    isWindow: true,
	    isViewForm: true,
        viewMode: readOnly,
        formMode: readOnly? 'viewFrm': 'editFrm',
	    bodyStyle: 'overflow-y: scroll'
    };
    if (pID) {
        frmJson.formMode = 'editFrm';
        frmJson.pID = pID;
    }
    else {
        frmJson.formMode = 'addFrm';
    }
    var form = new Senate.MainForm(frmJson); 
			
    var win = new Ext.Window({
	    id: 'owin-form',
	    layout: 'fit',
	    ctCls: 'body-panel',
				
	    margins: '0 5 0 0',
	    padding: 5,
	    width: 800,
	    height: 480,
	    autoScroll: true,
	    closeAction: 'close',
	    closable: true,
	    resizable: true,
	    maximizable: true,
	    //minimizable: true,
	    modal: true,
	    draggable: true,
	    buttonAlign: 'center',
	    tbar: new Ext.Toolbar(),
		        
	    buttonAlign: 'center',
	    buttons: [new Ext.Button({
		    text: 'Close',
		    handler: function(btn) {
		        var w = btn.ownerCt.ownerCt;
		        w.close();
		        w.destroy();
		    }
	    })],
	    tbar: tb,
	    items: form
	});

	if (!readOnly) {
	    var comd = new Ext.Button({
	        text: 'Save',
	        handler: function (btn) {
	            saveForm(form, function (keyValue) {
	                if (frmJson.formMode == 'addFrm') {
	                    if (callback) {
	                        callback();
	                    }

	                    win.close();
	                    win.destroy();
	                }
	                else {
	                    form = new Senate.MainForm({
	                        id: 'form-' + fmID,
	                        fmID: fmID,
	                        mainBody: body,
	                        isWindow: true,
	                        bodyStyle: 'overflow-y: scroll',
	                        formMode: 'editFrm',
	                        pID: keyValue
	                    });

	                    win.removeAll();
	                    win.add(form);
	                    win.doLayout();
	                }
	            });
	        }
	    });
	    tb.add(comd);
	}
			
    win.show();  
	
//	Ext.Ajax.request({
//		url: Senate.url.Comd,
//		method: 'GET',
//		params: { fmID: fmID, fmType: 1 },
//		success: function(result) {			
//			var frmJson = {
//				id: 'form-' + fmID,
//				fmID: fmID,
//				mainBody: body,
//				isWindow: true,
//				bodyStyle: 'overflow-y: scroll'
//			};
//			if (pID) {
//				frmJson.formMode = 'editFrm';
//				frmJson.pID = pID;
//			}
//			var form = new Senate.MainForm(frmJson); 
//			
//			var win = new Ext.Window({
//				id: 'win-form',
//		    	layout: 'fit',
//				ctCls: 'body-panel',
//				
//				margins: '0 5 0 0',
//		        padding: 5,
//		        width: 800,
//		        height: 480,
//		        autoScroll: true,
//		        closeAction: 'close',
//		        closable: true,
//		        resizable: true,
//		        maximizable: true,
//		        //minimizable: true,
//		        modal: true,
//		        draggable: true,
//		        buttonAlign: 'center',
//		        tbar: new Ext.Toolbar(),
//		        
//				buttonAlign: 'center',
//				buttons: [new Ext.Button({
//		    		text: 'OK',
//		    		handler: function(btn) {
//		    			var w = btn.ownerCt.ownerCt;
//		    			w.close();
//		    			w.destroy();
//		    			
//		    			if (callback) {
//		    				callback(form);
//		    			}
//		    		}
//		    	})],
//				tbar: tb,
//				items: form
//			});  
//			
//			var json = Ext.util.JSON.decode(result.responseText);
//			
//			if (json.success) {				
//				var data = json.data;	
//				for (var i = 0; i < data.length; i++) {		
//					var cells = data[i];	
//                    				
//					var comd = new Ext.Button({
//			        	iconCls: cells.iconCls,
//			            text: cells.lbName,
//			            fmID: cells.fmID,
//			            mmID: cells.mmID,
//			            cfmID: cells.cfmID,
//			            mcFuncID: cells.mcFuncID,
//			            repId: cells.repId,
//			            repCause: cells.repCause,
//			            
//			            spFunc: {					            
//				            spName: cells.spName,
//				            spReturn: cells.spReturn,
//				            spIn: cells.spIn,
//				            spOut: cells.spOut
//			            },
//			            handler: function(btn) {
//			            	switch (parseInt(btn.mcFuncID)) {
//			            		case Senate.cm.Save: {
//			            			saveForm(form, function(keyValue) {
//			            				form = new Senate.MainForm({
//											id: 'form-' + fmID,
//											fmID: fmID,
//											mainBody: body,
//											isWindow: true,
//											bodyStyle: 'overflow-y: scroll',
//											formMode: 'editFrm',
//					            			pID: keyValue
//								    	});
//			            				
//			            				win.removeAll();
//					            		win.add(form);
//								    	win.doLayout();
//			            			});
//			            			break;
//			            		}
//			            	}
//			            }
//					});
//					tb.add(comd);
//				}
//				tb.doLayout();
//			}
//			
//			win.show();  
//		}
//	});
}

function apply_viewForm(fdName) {
    var grid = get_grid(fdName);
    var cls = '';
    var cols = grid.getColumnModel();
    for (var i = 0; i < cols.getColumnCount(); i++) {
        var column = cols.getColumnById(cols.getColumnId(i));
        if (column.gfmID) {
            cls += '.x-grid3-col-' + column.id + ',';
        }
    }
    if (cls.length > 0) {
        cls = cls.substring(0, cls.length - 1);
    }

    var head = document.getElementsByTagName('head')[0];
    var temp = document.getElementById('col_class_' + grid.id);
    if (temp) {
        head.removeChild(temp);
    }

    var style = document.createElement('style');
    style.id = 'col_class_' + grid.id;
    var rules = document.createTextNode(cls + ' { background-image: url(resources/css/images/dbclick.gif); background-repeat: no-repeat; }');

    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = rules.nodeValue;
    }
    else {
        style.appendChild(rules);
    }
    head.appendChild(style);

    grid.addListener('celldblclick', function (g, row, col, e) {
        var cm = g.getColumnModel();
        var column = cm.getColumnById(cm.getColumnId(col));

        if (!column.gfmID)
            return;

        var split = column.gfmID.split(':');
        var fmID = split[0];
        var docID = g.getStore().getAt(row).get(split[1]);
        open_winForm(fmID, docID, true);
    });
}

function reload_form() {
    var panel = Ext.getCmp('main-form');
    var parent = panel.parentPage;

    parent.removeAll();
    parent.add(new Senate.MainForm({
        pID: panel.pID,
        fmID: panel.fmID,
        refFm: panel.refFm,
        parentPage: parent,
        mainBody: panel.mainBody,
        currentTab: panel.currentTab,
        formMode: 'editFrm'
    }));
    parent.doLayout();
}

function save_form(callback) {
	var panel = Ext.getCmp('main-form');
	var parent = panel.parentPage;

	saveForm(panel, function () {
	    if (typeof callback == 'function') {
	        callback();
	    }

		parent.removeAll();
		parent.add(new Senate.MainForm({
			pID: panel.keyValue,
    		fmID: panel.fmID,
    		refFm: panel.refFm,
			parentPage: parent,
    		mainBody: panel.mainBody,
    		currentTab: panel.currentTab,
			formMode: 'editFrm'
    	}));
        parent.doLayout();
    });
}

function submit_form(sp) {
    var panel = Ext.getCmp('main-form');
    var parent = panel.parentPage;

    saveForm(panel, function () {
        parent.removeAll();
        parent.add(new Senate.MainForm({
            fmID: panel.refFm,
            parentPage: parent,
            mainBody: panel.mainBody
        }));
        parent.doLayout();
    }, sp);

}

function debug(scriptText, params) {
    if (Ext.isIE) {
        scriptText = scriptText.replace(/console.log(.*);/ig, '');
    }
    eval(scriptText);

    if (params && params.callback) {
        params.callback();
    }
}

function writeLog(msg) {
    if (!Ext.isIE) {
        console.log(msg);
    }
}

function getParameter(name) {
    var search = location.search;
    if (search.trim().length == 0) {
        search = location.hash;
    }

    var val = decodeURI(
			(RegExp(name + '=' + '(.+?)(&|$)').exec(search) || [, null])[1]
		);
    return (val != 'null') ? val : '';
}
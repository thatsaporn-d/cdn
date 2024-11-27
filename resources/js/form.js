//v=1

Senate.fm.Grid = 1;
Senate.fm.Master = 2;

Senate.fd.Tab = 1;
Senate.fd.TabPanel = 2;
Senate.fd.LayoutPanel = 3;
Senate.fd.GridPanel = 4;
Senate.fd.Column = 5;
Senate.fd.TextField = 6;
Senate.fd.CheckBox = 7;
Senate.fd.GridEditor = 9;
Senate.fd.GridDetail = 10;
Senate.fd.DateField = 11;
Senate.fd.Radio = 12;
Senate.fd.Hidden = 13;
Senate.fd.ComboBox = 14;
Senate.fd.FieldSet = 15;
Senate.fd.FilterForm = 16;
Senate.fd.FileField = 17;
Senate.fd.PasswordField = 18;
Senate.fd.NumberField = 19;
Senate.fd.CurrencyField = 20;
Senate.fd.TextArea = 21;
Senate.fd.DateBetween = 22;
Senate.fd.TextBetween = 23;
Senate.fd.GridSelect = 24;
Senate.fd.GridMulti = 25;
Senate.fd.SelectOneField = 26;
Senate.fd.HtmlEditor = 27;
Senate.fd.Button = 28;
Senate.fd.IFrame = 29;
Senate.fd.BarChart = 30;
Senate.fd.LineChart = 31;
Senate.fd.PieChart = 32;
Senate.fd.GridMultiSelect = 33;
Senate.fd.TimeField = 34;
Senate.fd.ImageField = 35;
Senate.fd.ComboBoxBetween = 36;
Senate.fd.Calendar = 40;
Senate.fd.MonthField = 42;

Senate.tf.Integer = 1;
Senate.tf.String = 2;
Senate.tf.Boolean = 3;
Senate.tf.DateTime = 4;
Senate.tf.Currency = 6;
Senate.tf.Time = 7;

Senate.cm.OpenForm = 1;
Senate.cm.AddForm = 3;
Senate.cm.EditForm = 4;
Senate.cm.ViewForm = 5;
Senate.cm.InboxForm = 6;
Senate.cm.NewWindow = 10;
Senate.cm.Save = 21;
Senate.cm.Edit = 23;
Senate.cm.Void = 24;
Senate.cm.Copy = 26;
Senate.cm.Filter = 31;
Senate.cm.ShowAll = 32;
Senate.cm.Print = 42;
Senate.cm.PrintDraft = 43;
Senate.cm.SubmitToDF = 50;
Senate.cm.StoreFixed = 51;
Senate.cm.CallSP = 52;
Senate.cm.CallSPFixed = 53;
Senate.cm.SendMail = 60;
Senate.cm.Recall = 70;
Senate.cm.CloseForm = 99;
Senate.cm.Hold = 101;
Senate.cm.UnHold = 102;
Senate.cm.CloseWindow = 90;
Senate.cm.ReloadForm = 91;

Senate.ev.FormLoad = 1;
Senate.ev.MultiSelectUpdate = 2;
Senate.ev.BeforeSave = 3;
Senate.ev.BeforeSubmit = 4;
Senate.ev.MenuLoad = 5;
Senate.ev.AfterSave = 6;
Senate.ev.AfterSubmit = 7;
Senate.ev.BeforePrint = 8;
Senate.ev.BeforeVoid = 9;

Senate.gr.Label = 0;
Senate.gr.Sum = 1;
Senate.gr.Count = 2;
Senate.gr.Max = 3;
Senate.gr.Min = 4;
Senate.gr.Average = 5;

// [J2EE begin]
//Senate.url = {
//	Form: 'json/form.jsp',
//	Grid: 'json/grid.jsp',
//	Combo: 'json/combo.jsp',
//	Load: 'json/load.jsp',
//	Comd: 'json/comd.jsp',
//	Core: 'json/core.jsp',
//	Store: 'json/store.jsp',
//	Print: 'print.jsp',
//	Download: 'download.jsp',
//	Upload: 'data/upload.txt',
//	UploadImage: 'data/upload_image.txt'
//};
// [end]

var enableColumnHide = true;
var enableColumnResize = true;

Senate.MainForm = Ext.extend(Ext.form.FormPanel, {
   id: 'main-form',
   border: false,
   frame: true,

   runFilter: function(clear) {
      var panel = this;
      if (!panel.filterForm) {
         return;
      }

      var filterStr = '';
      if (!clear) {
         for (var i = 0; i < panel.dataFields.length; i++) {
            var field = panel.dataFields;
            if (panel.findById(field[i]) != null) {
               var f = panel.findById(field[i]);
               if (f.getXType() != 'button') {
                  var fieldName = f.getName();
                  var fieldValue = f.getValue();
                  filterStr += (fieldName + ';' + fieldValue + ';' + f.tfType);
                  if (i < panel.dataFields.length - 1) {
                     filterStr += '|';
                  }
               }
            }
         }
      }

      var grid = panel.filterGrid;

      grid.getStore().setBaseParam('filterStr', filterStr);
      grid.filterStr = filterStr;

      if (panel.extSearch) {
         var str = Ext.getCmp(panel.extSearch.field).getValue();
         grid.getStore().setBaseParam('extSearch', str + ';' + panel.extSearch.expr);
         grid.extSearch = str + ';' + panel.extSearch.expr;
      }
      if (grid.aggList) {
         grid.getStore().setBaseParam('aggList', Ext.util.JSON.encode(grid.aggList));
      }

      var gstore = grid.getStore();
      if (gstore.baseParams.temp) {
         gstore.setBaseParam('tbID', gstore.baseParams.temp);
      }
      grid.getStore().load();


      if (grid.groupCol || grid.isBuffer) {
         var getMask = function(grid) {
            var body = Ext.getDom(grid);
            return new Ext.LoadMask(body, {
               msg: "Please wait..."
            });
         };
         grid.maskLoading = getMask(grid.id);
         grid.maskLoading.show();
      }
   },

   checkPermission: function(fmID, callback) {
      call_sp({
         spName: 'up_00_CheckPermission',
         db: 'nc',
         params: [{
               name: 'in_WSID',
               type: 1,
               value: Senate.user.ws
            },
            {
               name: 'in_USID',
               type: 1,
               value: Senate.user.userId
            },
            {
               name: 'in_FMID',
               type: 1,
               value: fmID
            }
         ],
         outParams: [{
            name: 'in_IsPermit',
            type: 1
         }]
      }, function(sp) {
         if (sp.outParams[0] == 1) {
            callback();
         } else {
            show_error('You have no permission');
         }
      });
   },

   initComponent: function() {
      this.loadedForm = false;
      this.loadedComd = false;
      this.dataFields = new Array();
      this.filterFields = new Array();
      this.hiddenFiles = new Array();
      this.checkList = new Array();
      this.evList = new Array();

      var panel = this;
      var body = this.mainBody;
      var fmID = this.fmID;
      var refFm = this.refFm;
      var parent = this.parentPage;
      var pID = this.pID;
      var formMode = this.formMode;
      var evList = this.evList;
      var cusId = this.customId;
      var isApproved = this.approved;
      var isVoid = this.voidStatus;

      var tbar = new Ext.Toolbar();
      if (!this.isWindow) {
         tbar = body.getTopToolbar();
         this.tabIndex = 100;
      } else {
         this.tabIndex = 1000;
         this.loadedComd = true;
      }

      if (fmID == Senate.ffm.User || fmID == Senate.ffm.UserGroup) {
         for (var i = tbar.items.length - 1; i > 1; i--) {
            tbar.remove(i);
         }
         loadCustom(fmID, pID, panel, body);
      }
      //    	else if (cusId) {
      //    	    var data = [
      //	        	{ Label: 'Field_1', TFName: 'Field_1', ControlTypeID: 0, Row: 0, Col: 0 },
      //	        	{ Label: 'Field_2', TFName: 'Field_2', ControlTypeID: 0, Row: 0, Col: 1 },
      //	        	{ Label: 'PName', TFName: 'PName', ControlTypeID: 0, Row: 1, Col: 0 },
      //	        	{ Label: 'TempName', TFName: 'TempName', ControlTypeID: 0, Row: 2, Col: 1 }
      //	        ];  		
      //        	
      //        	var layouts = new Array();
      //    		
      //    		var tabIndex = 10000;
      //    		
      //    		for (var i = 0; i < data.length; i++) {
      //    			var rec = data[i];
      //    			
      //    			var row = rec.Row;        		
      //    			if (!layouts[row]) {
      //	    			layouts[row] = new Ext.Panel({
      //		        		layout: 'column',
      //						border: false,
      //		        		defaults: { labelWidth: 120, padding: '0px 5px 0px 5px' },
      //		        		items: [
      //	        		        new Ext.Panel({    	
      //			        			columnWidth: .5, 
      //			        			layout: 'form',
      //			        			border: false,
      //			        			html: '<img src="resources/css/images/pixel.gif" />',
      //			        			
      //			        			items: []
      //			        		}), new Ext.Panel({    	
      //			        			columnWidth: .5, 
      //			        			layout: 'form',
      //			        			border: false,
      //			        			html: '<img src="resources/css/images/pixel.gif" />',
      //			        			
      //			        			items: []
      //			        		})
      //		        		]
      //		    		});
      //	    			panel.add(layouts[row]);
      //    			}
      //    			
      //    			var type = rec.ControlTypeID;
      //    			var label = rec.Label;
      //    			var tfName = rec.TFName;
      //    			
      //    			var comp = null;
      //    			switch (type) {
      //	    			case 0: {
      //	    				comp = new Ext.form.TextField({
      //	    					name: tfName,
      //	    					fieldLabel: label,
      //	    					anchor: '100%',
      //	    				
      //	    					tabIndex: tabIndex + i
      //	    				});
      //	    				break;
      //	    			}
      //    			}
      //    			
      //    			var col = rec.Col;
      //    			if (comp) {
      //    				panel.dataFields.push(comp.id);
      //    				
      //    				switch (col) {
      //    					case 0: {
      //    						layouts[row].get(0).add(comp);
      //    						break;
      //    					} 
      //    					case 1: {
      //    						layouts[row].get(1).add(comp);
      //    						break;
      //    					} 
      //    				}
      //    			}
      //    		}
      //			
      //    		panel.doLayout();
      //    	}
      else {
         body.showLoading();

         Ext.Ajax.request({
            url: Senate.url.Form,
            method: 'GET',
            params: {
               fmID: fmID,
               psmtid: panel.psmtid
            },
            success: function(result) {
               var json = Ext.util.JSON.decode(result.responseText);
               var data = json.data;

               //					try {
               var pk = getGenerateForm(panel, data);

               panel.fmType = data[0].fmType;

               var frmList = panel.getForm().items;
               for (var i = 0; i < frmList.length; i++) {
                  genExpr(panel, frmList.get(i));
               }

               for (var i = 0; i < panel.details.length; i++) {
                  var g = panel.details[i];
                  var cm = g.getColumnModel();
                  for (var j = 0; j < cm.getColumnCount(); j++) {
                     var col = cm.getColumnById(cm.getColumnId(j));
                     if (col.calc) {
                        var rep = col.calc;
                        while (rep.indexOf('{') > -1) {
                           var ff = rep.substring(rep.indexOf('{'), rep.indexOf('}') + 1);
                           rep = rep.replace(ff, '');

                           var refCol = cm.getColumnById('col-' + ff.substring(1, ff.length - 1));

                           if (refCol) {
                              refCol.calTarget = {
                                 dataIndex: col.dataIndex,
                                 expr: col.calc
                              };
                           }
                        }
                     }
                  }
               }

               var evs = json.items;
               if (evs) {
                  for (var i = 0; i < evs.length; i++) {
                     var ev = evs[i];
                     evList[ev.eventID] = ev.scriptText;
                  }
               }

               if (pID != null && panel.getForm().findField('TBID')) {
                  loadForm(panel, pID, body, pk);
               } else {
                  panel.loadedForm = true;
                  if (panel.loadedForm && panel.loadedComd) {
                     panel.hideLoading(body);
                  }

                  //                        if (evList[Senate.ev.FormLoad]) {
                  //                            debug(evList[Senate.ev.FormLoad]);
                  //                        }
               }

               if (panel.filterForm) {
                  new Ext.KeyNav(panel.getForm().getEl(), {
                     'enter': function(e) {
                        panel.runFilter();
                     },
                     'scope': this
                  });
               }

               if (!panel.isWindow && !panel.ignoreCmd) {
                  if (!tbar) {
                     tbar = body.getTopToolbar();
                  }
                  panel.loadMenuButtons(tbar);
               } else {
                  panel.hideLoading(body);
               }
            }
         });
      }
      Senate.MainForm.superclass.initComponent.call(this);
   },

   loadMenuButtons: function(tbar) {
      var panel = this;
      var body = this.mainBody;
      var fmID = this.fmID;
      var refFm = this.refFm;
      var parent = this.parentPage;
      var pID = this.pID;
      var formMode = this.formMode;
      var evList = this.evList;
      var cusId = this.customId;
      var isApproved = this.approved;

      var fmType = -1;
      if (formMode == 'inbox') {
         fmType = 0;
      } else if (formMode == 'addFrm') {
         fmType = 1;
      } else if (formMode == 'editFrm') {
         fmType = 2;
      } else if (formMode == 'viewFrm') {
         fmType = 3;
      }

      Ext.Ajax.request({
         url: Senate.url.Comd,
         method: 'GET',
         params: {
            fmID: fmID,
            fmType: fmType
         },
         success: function(result) {
            var json = Ext.util.JSON.decode(result.responseText);

            if (json.success) {
               var data = json.data;
               for (var i = tbar.items.length - 1; i > 1; i--) {
                  tbar.remove(i);
               }

               tbar.add('->');
               for (var i = 0; i < data.length; i++) {
                  var cells = data[i];

                  var checkMode = null;
                  if (formMode == 'inbox') {
                     checkMode = cells.inbox;
                  } else if (formMode == 'addFrm') {
                     checkMode = cells.addFrm;
                  } else if (formMode == 'editFrm') {
                     checkMode = cells.editFrm;
                  } else if (formMode == 'viewFrm') {
                     checkMode = cells.viewFrm;
                  }

                  var isRender = true;
                  if (checkMode == false) {
                     isRender = false;
                  }

                  if (panel.loadedForm && cells.mcFuncID == Senate.cm.SendMail) {
                     if (get_field('Approved') && !get_value('Approved')) {
                        isRender = false;
                     }
                  }

                  if (cells.mcFuncID == Senate.cm.Print && !isApproved) {
                     isRender = false;
                  }

                  if (cells.mcFuncID == Senate.cm.PrintDraft && isApproved) {
                     isRender = false;
                  }

                  if (cells.mcFuncID == Senate.cm.NewWindow && getParameter('fmID')) {
                     isRender = false;
                  }

                  if ((cells.mcFuncID == Senate.cm.Void || cells.mcFuncID == Senate.cm.Print || cells.mcFuncID == Senate.cm.PrintDraft) && panel.voidStatus) {
                     isRender = false;
                  }

                  if (isRender) {
                     var btnText = cells.lbName;
                     if (cells.mcFuncID == Senate.cm.Print || cells.mcFuncID == Senate.cm.PrintDraft) {
                        btnText += ' (PDF)';
                     }

                     tbar.add(new Ext.Button({
                        iconCls: cells.iconCls,
                        text: btnText,
                        fmID: cells.fmID,
                        mmID: cells.mmID,
                        cfmID: cells.cfmID,
                        mcFuncID: cells.mcFuncID,
                        repId: cells.repId,
                        repCause: cells.repCause,
                        slot1: cells.slot1,
                        mailExpr: cells.mailExpr,
                        pkField: cells.pkField,
                        mcName: cells.mcName,

                        spFunc: {
                           spName: cells.spName,
                           spReturn: cells.spReturn,
                           spIn: cells.spIn,
                           spOut: cells.spOut
                        },
                        handler: function(btn) {
                           if (parseInt(btn.cfmID) == Senate.customerQn) {
                              var docID = null;
                              var viewMode = false;
                              if (parseInt(btn.mcFuncID) == Senate.cm.EditForm || parseInt(btn.mcFuncID) == Senate.cm.ViewForm) {
                                 var grid = panel.details[0];
                                 if (grid.keyValue == undefined) {
                                    showMessage('กรุณาเลือกรายการ');
                                 } else {
                                    docID = grid.keyValue;
                                 }

                                 if (parseInt(btn.mcFuncID) == Senate.cm.ViewForm) {
                                    viewMode = true;
                                 }
                              }

                              for (var i = tbar.items.length - 1; i > 1; i--) {
                                 tbar.remove(i);
                              }
                              tbar.add('->');
                              var btnBack = new Ext.Button({
                                 text: 'Back',
                                 dataObj: {
                                    parent: parent,
                                    refFm: panel.fmID,
                                    body: body
                                 },
                                 handler: function(btn) {
                                    
                                    var obj = btn.dataObj;

                                    parent.removeAll();
                                    parent.add(new Senate.MainForm({
                                       fmID: obj.refFm,
                                       parentPage: obj.parent,
                                       mainBody: obj.body
                                    }));
                                    parent.doLayout();
                                 }
                              });
                              tbar.add(btnBack);
                              tbar.doLayout();

                              parent.removeAll();
                              parent.add(new QNForm({
                                 docID: docID,
                                 viewMode: viewMode
                              }));
                              parent.doLayout();
                              return;
                           }

                           panel.btnclick = btn.mcFuncID;
                           switch (parseInt(btn.mcFuncID)) {
                              case Senate.cm.AddForm: {
                                 if (btn.cfmID != null) {
                                    parent.removeAll();
                                    parent.add(new Senate.MainForm({
                                       fmID: btn.cfmID,
                                       refFm: btn.fmID,
                                       parentPage: parent,
                                       mainBody: body,
                                       formMode: 'addFrm'
                                    }));
                                    parent.doLayout();
                                 }
                                 break;
                              }
                              case Senate.cm.EditForm: {
                                 if (formMode == 'inbox' && btn.slot1) {
                                    var refForm = panel.getForm();
                                    var key = refForm.findField(btn.slot1);
                                    if (key) {
                                       var keyValue = key.getValue();
                                       var obj = btn.dataObj;

                                       parent.removeAll();
                                       parent.add(new Senate.MainForm({
                                          pID: keyValue,
                                          fmID: btn.cfmID,
                                          //refFm: panel.fmID,
                                          refFm: refForm,
                                          //parentPage: parent,
                                          //mainBody: panel.mainBody
                                          parentPage: parent,
                                          mainBody: body,
                                          formMode: 'inbox',
                                          tempInbox: Ext.getCmp('page-tab').temp
                                       }));
                                       parent.doLayout();
                                       //Ext.getCmp('page-tab').temp
                                       //new Senate.VerifyPanel(panel.tempInbox)
                                    } else {
                                       showMessage('field "' + btn.slot1 + '" not found');
                                    }
                                 } else {
                                    var grid = panel.details[0];
                                    if (grid.keyValue == undefined) {
                                       showMessage('กรุณาเลือกรายการ');
                                    } else {
                                       if (grid.dynFmID) {
                                          btn.cfmID = grid.dynFmID;
                                       }

                                       var approved = false;
                                       var row = grid.getSelectionModel().getSelected().data;
                                       if (row['Approved'] || row['APPROVED']) {
                                          approved = true;
                                       }

                                       parent.removeAll();
                                       parent.add(new Senate.MainForm({
                                          pID: grid.keyValue,
                                          voidStatus: grid.voidStatus,
                                          //												    		fmID: grid.cfmID,
                                          approved: approved,
                                          fmID: btn.cfmID,
                                          refFm: panel.fmID,
                                          parentPage: parent,
                                          mainBody: panel.mainBody,
                                          formMode: 'editFrm'
                                       }));
                                       parent.doLayout();
                                    }
                                 }
                                 break;
                              }
                              case Senate.cm.ViewForm: {
                                 var grid = panel.details[0];
                                 if (grid.keyValue == undefined) {
                                    showMessage('กรุณาเลือกรายการ');
                                 } else {
                                    if (grid.dynFmID) {
                                       btn.cfmID = grid.dynFmID;
                                    }

                                    var approved = false;
                                    var row = grid.getSelectionModel().getSelected().data;
                                    if (row['Approved'] || row['APPROVED']) {
                                       approved = true;
                                    }

                                    parent.removeAll();
                                    parent.add(new Senate.MainForm({
                                       pID: grid.keyValue,
                                       //												    		fmID: grid.cfmID,
                                       fmID: btn.cfmID,
                                       voidStatus: grid.voidStatus,
                                       approved: approved,
                                       refFm: panel.fmID,
                                       parentPage: parent,
                                       mainBody: panel.mainBody,
                                       viewMode: true,
                                       formMode: 'viewFrm'
                                    }));
                                    parent.doLayout();
                                 }
                                 break;
                              }
                              case Senate.cm.Copy: {
                                 var grid = panel.details[0];
                                 if (grid.keyValue == undefined) {
                                    showMessage('กรุณาเลือกรายการ');
                                 } else {
                                    parent.removeAll();
                                    parent.add(new Senate.MainForm({
                                       pID: grid.keyValue,
                                       isCopy: true,
                                       //fmID: grid.cfmID,
                                       fmID: btn.cfmID,
                                       refFm: panel.fmID,
                                       parentPage: parent,
                                       mainBody: panel.mainBody
                                    }));
                                    parent.doLayout();
                                 }
                                 break;
                              }
                              case Senate.cm.InboxForm: {
                                 var win = new Senate.FormWindow();
                                 var pkField = btn.pkField;
                                 var keyValue = null;
                                 if (pkField && pkField.trim().length > 0) {
                                    var keyName = pkField.substring(1);
                                    keyValue = panel.getForm().findField(keyName).getValue();
                                 }
                                 win.showInfo(btn.cfmID, panel, keyValue);
                                 break;
                              }
                              case Senate.cm.OpenForm: {
                                 break;
                              }
                              case Senate.cm.NewWindow: {
                                 
                                 var fmID = btn.cfmID;
                                 if (!btn.cfmID) {
                                    alert('FMID not found');
                                    break;
                                 }

                                 panel.checkPermission(fmID, function() {
                                    var mode = '&mode=';
                                    var pid = '&pid=';
                                    if (btn.pkField) {
                                       var key = panel.getForm().findField(btn.pkField.substring(1));
                                       if (key) {
                                          pid += key.getValue();
                                       } else {
                                          show_error(btn.pkField + ' not found');
                                       }
                                    }
                                    switch (parseInt(btn.slot1)) {
                                       case 1: {
                                          mode += 'addFrm';
                                          break;
                                       }
                                       case 2: {
                                          mode += 'editFrm';
                                          break;
                                       }
                                       case 3: {
                                          mode += 'viewFrm';
                                          break;
                                       }
                                    }

                                    var title = btn.text;
                                    var h = screen.height - 300;
                                    var w = screen.width - 300;
                                    var left = (screen.width / 2) - (w / 2);
                                    var top = (screen.height / 2) - (h / 2);
                                    window.open("Default.aspx?fmID=" + fmID + "&title=" + title + mode + pid, "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=" + w + ", height=" + h + ",top=" + top + ",left=" + left);
                                 });

                                 break;
                              }
                              case Senate.cm.Print: {
                                 var printFn = function(open) {
                                    var url = Senate.url.Print + '?rid=' + btn.repId + '&key=' + btn.repCause + '&pid=' + panel.pID + '&type=pdf' + '&docno=' + Ext.getCmp('main-form').getForm().findField('DOCNO').getValue() + '&uid=' + Senate.user.userId;
                                    if (!open) {
                                       window.location = url;
                                    } else {
                                       window.open(url);
                                    }
                                 }

                                 if (panel.evList[Senate.ev.BeforePrint]) {
                                    debug(panel.evList[Senate.ev.BeforePrint], {
                                       mcName: btn.mcName,
                                       print: printFn
                                    });
                                 } else {
                                    printFn();
                                 }
                                 break;
                              }
                              case Senate.cm.PrintDraft: {
                                 var printFn = function(open) {
                                    var url = Senate.url.Print + '?rid=' + btn.repId + '&key=' + btn.repCause + '&pid=' + panel.pID + '&type=pdf' + '&docno=' + Ext.getCmp('main-form').getForm().findField('DOCNO').getValue() + '&uid=' + Senate.user.userId;
                                    if (!open) {
                                       window.location = url;
                                    } else {
                                       window.open(url);
                                    }
                                 }

                                 if (panel.evList[Senate.ev.BeforePrint]) {
                                    debug(panel.evList[Senate.ev.BeforePrint], {
                                       mcName: btn.mcName,
                                       print: printFn
                                    });
                                 } else {
                                    printFn();
                                 }
                                 break;
                              }
                              case Senate.cm.Save: {
                                 
                                 if (panel.evList[Senate.ev.BeforeSave]) {
                                    //console.log('>> before save');
                                    debug(panel.evList[Senate.ev.BeforeSave]);
                                 } else {
                                    //save_form();
                                    if (panel.formMode == 'inbox') {
                                       saveForm(panel, function() {
                                          parent.removeAll();
                                          parent.add(new Senate.DoVerifyPanel({
                                             tranID: Senate.VerifyInfo.DocNo,
                                             docID: Senate.VerifyInfo.DFDocID,
                                             docType: Senate.VerifyInfo.DocType,
                                             refDoc: Senate.VerifyInfo.refDoc,
                                             mainBody: Senate.VerifyInfo.mainBody,
                                             isEditable: Senate.VerifyInfo.IsEditable,
                                             showVerify: ('load-inbox' == 'load-inbox') ? true : false
                                          }));
                                          parent.doLayout();
                                       });
                                    } else {
                                       saveForm(panel, function() {
                                          parent.removeAll();
                                          parent.add(new Senate.MainForm({
                                             pID: panel.keyValue,
                                             fmID: panel.fmID,
                                             refFm: panel.refFm,
                                             parentPage: parent,
                                             mainBody: panel.mainBody,
                                             currentTab: panel.currentTab,
                                             formMode: 'editFrm',
                                             tempInbox: panel.tempInbox
                                          }));
                                          parent.doLayout();
                                       });
                                    }
                                 }
                                 break;
                              }
                              case Senate.cm.SubmitToDF: {
                                 Ext.MessageBox.confirm('Confirm', 'Are you sure you want submit?', function(btnRes) {
                                    if (btnRes == 'yes') {
                                       if (panel.evList[Senate.ev.BeforeSubmit]) {
                                          //console.log('>> before submit: ' + btn.spFunc.spName);
                                          debug(panel.evList[Senate.ev.BeforeSubmit], {
                                             sp: Ext.util.JSON.encode(btn.spFunc)
                                          });
                                       } else {
                                          saveForm(panel, function() {
                                             parent.removeAll();
                                             parent.add(new Senate.MainForm({
                                                fmID: refFm,
                                                parentPage: parent,
                                                mainBody: body
                                             }));
                                             parent.doLayout();
                                          }, Ext.util.JSON.encode(btn.spFunc));
                                       }

                                    }
                                 });

                                 //                                                if (!panel.invalid) {
                                 //                                                }
                                 break;
                              }
										case Senate.cm.Recall: {
											if(btn.mcName == 'Recall' && formMode == undefined){
												var grid = panel.details[0];
												var selRec = grid.getSelectionModel().getSelected();

												if(selRec) {
													Ext.MessageBox.confirm('Recall', 'Are you sure, you want to Recall?', function(btnRes) {
														if (btnRes == 'yes') {
															var grid = panel.details[0];
															var selRec = grid.getSelectionModel().getSelected();

															if(selRec) {
																var selRecData = selRec.data;
																if (grid.keyValue == undefined) {
																	showMessage('กรุณาเลือกรายการ');
																}else{ 
																	var dfDocNo = selRecData.DFDocNo;
																	var isVoid = Number(selRecData.VoidStatus);
																	var isApproved = Number(selRecData.Approved);
																	if(!(isVoid == 1 || isApproved == 1)) {
																		load_data({
																				  tbID: 10123,
																				  params: [
																						{ name: 'DFDOCNO', value: dfDocNo }
																				  ]
																			}, function(data) {
																				var isRead = Number(data[0].readstatus);
																				var docno = data[0].DocNo;
																				if(isRead == 0) {
																					show_loading();
																					var panel = Ext.getCmp('main-form');
																					var parent = panel.parentPage;
																					var body = Ext.getCmp('body-panel');
																					
																					var pparams = new Array();
																					
																					var docType = data[0].DocType;
																					var docID = data[0].DocID; 
																					var tranID = data[0].TranID;
																					var dfDocID = data[0].DFDocID;
																					var values = [docID, docType, dfDocID, Number(Senate.user.userId)];
																					var types = [Senate.tf.Integer, Senate.tf.Integer, Senate.tf.Integer, Senate.tf.Integer];
																					var names = ['in_DocID', 'in_DocType', 'in_DFDocID', 'in_USID'];

																					var pp = new Array();
																					for (var i = 0; i < values.length; i++) {
																						pp.push({
																							name: names[i],
																							type: types[i],
																							value: values[i]
																						});
																					}
																					pparams.push(pp);
																					
																					Senate.RecallInfo = {
																						DocID: docID,
																						FMID: btn.cfmID,
																						keyValue: grid.keyValue,
																						DocType: docType,
																						DFDocID: dfDocID,
																						parentPage: parent,
																						mainBody: body,
																						parentFMID:parent.fmID
																					};
																					
																					call_sp({
																							spName: 'up_DF_Recall_Doc',
																							loading: false,
																							params: pparams
																						}, function (res) {
																							hide_loading();
																							if (res.retCode > -1) {
																								parent.removeAll();
																								parent.add(new Senate.MainForm({
																									pID: Senate.RecallInfo.keyValue,
																									voidStatus: Senate.RecallInfo.voidStatus,
																									approved: Senate.RecallInfo.approved,
																									fmID: Senate.RecallInfo.FMID,
																									refFm: panel.fmID,
																									parentPage: parent,
																									mainBody: panel.mainBody,
																									formMode: 'editFrm'
																								}));
																								parent.doLayout();
																							}else{
																								show_error('Unable to recall document: ' + docno);
																							}
																						}
																					);
																				}else{
																					show_info('The Document: ' + docno +' can not recall.');
																				}
																			}
																		);
																	}
																}
															}
														}
													});
												}
											}
											break;
										}
                                        case Senate.cm.Hold: {
                                            debugger;
                                            var grid = panel.details[0];
                                            var rec = grid.selRec;
                                            if(btn.mcName == 'Hold' && formMode == undefined && grid.getSelectionModel().getSelected() != undefined){
                                                var stringHold = "Hold";
                                                var holdNumber = 1;
                                                Ext.MessageBox.confirm('Hold', 'Are you sure, you want to ' + stringHold + '?', function(btnRes) {
                                                    if (btnRes == 'yes') {
                                                        var icidString = '';
                                                        for (r in rec) {
                                                           if (typeof rec[r] != 'function') {
                                                                icidString = icidString + rec[r].data.ICID + ',';
                                                           }
                                                        }
                                                        icidString = icidString.substring(0, icidString.length-1);

                                                        var pparams = new Array();
                                                        var values = [icidString, holdNumber];
                                                        var types = [Senate.tf.String, Senate.tf.Integer];
                                                        var names = ['in_ICID', 'in_ISHOLD'];

                                                        var pp = new Array();
                                                        for (var i = 0; i < values.length; i++) {
                                                            pp.push({
                                                                name: names[i],
                                                                type: types[i],
                                                                value: values[i]
                                                            });
                                                        }
                                                        pparams.push(pp);

                                                        call_sp({
                                                                spName: 'UP_HOLDBILLING',
                                                                loading: false,
                                                                params: pparams
                                                            }, function (res) {
                                                                hide_loading();
                                                                if (res.retCode > -1) {
                                                                    show_info('Selected PSM code is Hold.');
                                                                    get_grid('grid').getStore().load();
                                                                }else{
                                                                    show_error('Selected PSM code can not Hold.');
                                                                    get_grid('grid').getStore().load();
                                                                }
                                                            }
                                                        );
                                                    }
                                                });
                                            }
                                            break;
                                        }
                                        case Senate.cm.UnHold: {
                                            debugger;
                                            var grid = panel.details[0];
                                            var rec = grid.selRec;
                                            if(btn.mcName == 'UnHold' && formMode == undefined && grid.getSelectionModel().getSelected() != undefined){
                                                var stringHold = "UnHold";
                                                var holdNumber = 0;
                                                Ext.MessageBox.confirm('UnHold', 'Are you sure, you want to ' + stringHold + '?', function(btnRes) {
                                                    if (btnRes == 'yes') {
                                                        var icidString = '';
                                                        for (r in rec) {
                                                           if (typeof rec[r] != 'function') {
                                                                icidString = icidString + rec[r].data.ICID + ',';
                                                           }
                                                        }
                                                        icidString = icidString.substring(0, icidString.length-1);

                                                        var pparams = new Array();
                                                        var values = [icidString, holdNumber];
                                                        var types = [Senate.tf.String, Senate.tf.Integer];
                                                        var names = ['in_ICID', 'in_ISHOLD'];

                                                        var pp = new Array();
                                                        for (var i = 0; i < values.length; i++) {
                                                            pp.push({
                                                                name: names[i],
                                                                type: types[i],
                                                                value: values[i]
                                                            });
                                                        }
                                                        pparams.push(pp);

                                                        call_sp({
                                                                spName: 'UP_HOLDBILLING',
                                                                loading: false,
                                                                params: pparams
                                                            }, function (res) {
                                                                hide_loading();
                                                                if (res.retCode > -1) {
                                                                    show_info('Selected PSM code is UnHold.');
                                                                    get_grid('grid').getStore().load();
                                                                }else{
                                                                    show_error('Selected PSM code can not UnHold.');
                                                                    get_grid('grid').getStore().load();
                                                                }
                                                            }
                                                        );
                                                    }
                                                });
                                            }
                                            break;
                                        }
                              case Senate.cm.CallSP: {
                                 if (panel.evList[Senate.ev.BeforeSubmit]) {
                                    //console.log('>> before invoke: ' + btn.spFunc.spName);
                                    debug(panel.evList[Senate.ev.BeforeSubmit], {
                                       sp: btn.spFunc
                                    });
                                 } else {
                                    saveForm(panel, function() {
                                       parent.removeAll();
                                       parent.add(new Senate.MainForm({
                                          fmID: refFm,
                                          parentPage: parent,
                                          mainBody: body
                                       }));
                                       parent.doLayout();
                                    }, btn.spFunc);
                                 }

                                 //                                                if (!panel.invalid) {
                                 //                                                }
                                 break;
                              }
                              case Senate.cm.CallSPFixed: {
                                 if (panel.evList[Senate.ev.BeforeSubmit]) {
                                    //console.log('>> before invoke: ' + btn.spFunc.spName);
                                    debug(panel.evList[Senate.ev.BeforeSubmit], {
                                       sp: btn.spFunc
                                    });
                                 } else {
                                    saveForm(panel, function() {
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
                                    }, btn.spFunc);
                                 }
                                 break;
                              }
                              case Senate.cm.StoreFixed: {
                                 if (panel.evList[Senate.ev.BeforeSubmit]) {
                                    //console.log('>> before submit: ' + btn.spFunc.spName);
                                    debug(panel.evList[Senate.ev.BeforeSubmit], {
                                       sp: Ext.util.JSON.encode(btn.spFunc)
                                    });
                                 } else {
                                    saveForm(panel, function() {
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
                                    }, Ext.util.JSON.encode(btn.spFunc));
                                 }
                                 break;
                              }
                              case Senate.cm.Void: {
                                 Ext.MessageBox.show({
                                    title: 'Void',
                                    msg: 'Please enter your reason:',
                                    width: 300,
                                    maxlength: 500,
                                    buttons: Ext.MessageBox.OKCANCEL,
                                    multiline: true,
                                    fn: function(act, text) {
                                       if (act == 'ok') {
                                          btn.spFunc.voidText = text;

                                          var saveVoid = function() {
                                             saveForm(panel, function() {
                                                parent.removeAll();
                                                parent.add(new Senate.MainForm({
                                                   fmID: refFm,
                                                   parentPage: parent,
                                                   mainBody: body
                                                }));
                                                parent.doLayout();
                                             }, Ext.util.JSON.encode(btn.spFunc));
                                          };

                                          if (panel.evList[Senate.ev.BeforeVoid]) {
                                             debug(panel.evList[Senate.ev.BeforeVoid], {
                                                save: saveVoid
                                             });
                                          } else {
                                             saveVoid();
                                          }
                                       }
                                    }
                                 });
                                 break;
                              }
                              case Senate.cm.SendMail: {
                                 if (btn.mailExpr) {
                                    var json = btn.mailExpr.replace(/\s*,\s*/ig, '","').replace(/\s*:\s*/ig, '":"');
                                    var expr = Ext.util.JSON.decode('{"' + json + '"}');

                                    var gridRecv = get_grid(expr.to);
                                    var gridAttach = get_grid(expr.attach);
                                    var subject = get_value(expr.subject);
                                    var msg = get_field(expr.msg);

                                    var attachStore = gridAttach.getStore();
                                    var attachCm = gridAttach.getColumnModel();
                                    var attachFiles = new Array();
                                    for (var j = 0; j < attachStore.getCount(); j++) {
                                       var rec = attachStore.getAt(j);
                                       if (rec.get('AttachLink')) {
                                          var link = rec.get('AttachLink');
                                          if (link && link.trim().length > 0) {
                                             var start = link.indexOf('dir="');
                                             var end = link.lastIndexOf(' href');
                                             var path = link.substring(start + 5, end - 1).split('|')[0];

                                             attachFiles.push(path);
                                          }
                                       }
                                    }

                                    var recvStore = gridRecv.getStore();
                                    var recvCm = gridRecv.getColumnModel();
                                    var mailData = new Array();
                                    for (var j = 0; j < recvStore.getCount(); j++) {
                                       var rec = recvStore.getAt(j);
                                       if (rec.get('EMAIL')) {
                                          var rawMsg = msg.getRawValue();
                                          for (var k = 0; k < recvCm.getColumnCount(); k++) {
                                             if (recvCm.getDataIndex(k)) {
                                                rawMsg = rawMsg.replace('&lt;' + recvCm.getDataIndex(k) + '&gt;', rec.get(recvCm.getDataIndex(k)));
                                             }
                                          }

                                          var mail = {};
                                          mail.to = rec.get('EMAIL');
                                          mail.subject = subject;
                                          mail.body = rawMsg;
                                          mail.attach = attachFiles;

                                          mailData.push(mail);
                                       }
                                    }

                                    Ext.Ajax.request({
                                       url: Senate.url.Mail,
                                       method: 'POST',
                                       params: {
                                          mailData: Ext.util.JSON.encode(mailData)
                                       },
                                       success: function(result) {
                                          hide_loading();

                                          var json = Ext.util.JSON.decode(result.responseText);

                                          if (json.success) {
                                             show_info('Success');
                                          } else {
                                             show_error('Failed, an e-mail cannot be sent');
                                          }
                                       },
                                       failure: function() {
                                          hide_loading();
                                          show_error('Error, an e-mail cannot be sent');
                                       }
                                    });
                                 } else {
                                    // read data from 'mConfig'
                                 }
                                 break;
                              }
                              case Senate.cm.Filter: {
                                 panel.runFilter();
                                 break;
                              }
                              case Senate.cm.ShowAll: {
                                 panel.getForm().reset();
                                 panel.filterGrid.getStore().setBaseParam('filterStr', null);
                                 var gstore = grid.getStore();
                                 if (gstore.baseParams.temp) {
                                    gstore.setBaseParam('tbID', gstore.baseParams.temp);
                                 }
                                 panel.filterGrid.getStore().load();
                                 break;
                              }
							  case Senate.cm.CloseWindow: {
								  window.close();
								  break;
							  }
							  case Senate.cm.ReloadForm: {
									reForm = function() {
										parent.removeAll();
										parent.add(new Senate.MainForm({
											pID: panel.keyValue,
											fmID: panel.fmID,
											refFm: panel.refFm,
											parentPage: parent,
											mainBody: panel.mainBody,
											currentTab: panel.currentTab,
											formMode: 'editFrm',
											tempInbox: panel.tempInbox
										})); 
										parent.doLayout();
									}

									if(panel.keyValue) reForm();
									else {
										var isWinFrm = true;
										var wdForm = Ext.getCmp('swin-form');
										if(wdForm == undefined) wdForm = Ext.getCmp('win-form');
										if(wdForm == undefined) { wdForm = Ext.getCmp('main-form');  isWinFrm = false; }
										var ctl = Ext.query('[id*=w' + panel.fmID + '][className*=x-form-field x-box-item], [id*=w' + panel.fmID + '][className*=x-form-textarea x-form-field], [id*=w' + panel.fmID + '][className*=x-form-text x-form-field], [id*=w' + panel.fmID + '][className*=x-form-text x-form-field x-box-item]');
										if(ctl.length == 0 ) ctl = Ext.query('[id*=' + panel.fmID + '][className*=x-form-field x-box-item], [id*=' + panel.fmID + '][className*=x-form-textarea x-form-field], [id*=' + panel.fmID + '][className*=x-form-text x-form-field], [id*=' + panel.fmID + '][className*=x-form-text x-form-field x-box-item]');
										
										for (i = 0; i < ctl.length; i++) {
											try {
												var fname = ctl[i].id.split('-');
												var fd = get_field(fname[fname.length - 1], isWinFrm);
												if (fd.store != undefined) {
													if (!(fd.store.comboId == undefined  || fd.store.comboId == '')) {
														fd.getStore().load();
													}
												} 
											} catch {}
										}
									}
									
								  break;
							  }
                              case Senate.cm.CloseForm: {
                                 function back() {
                                    if (panel.formMode == 'inbox') {
                                       var inboxTab = Ext.getCmp('inbox-tab');
													if(inboxTab){
														var parent = panel.parentPage;
														var body = panel.mainBody;

														hide_loading();
														parent.removeAll();
														parent.add(new Senate.MainForm({
															fmID: 500,
															parentPage: parent,
															mainBody: body
														}));
														parent.doLayout();
													}else{
														Senate.Doverifyclick(
															Senate.VerifyInfo.RefDocID,
															Senate.VerifyInfo.FMID,
															Senate.VerifyInfo.DocNo,
															Senate.VerifyInfo.ProcessName,
															Senate.VerifyInfo.RecvDate,
															Senate.VerifyInfo.DocType,
															Senate.VerifyInfo.IsEditable,
															Senate.VerifyInfo.DFDocID);
													}
                                    } else if (panel.formMode == 'process') {
                                       var body = panel.mainBody;
                                       body.removeAll();
                                       body.add(new Senate.InboxTab({
                                          mainBody: body,
                                          act: 'load-process',
                                          isProcess: true,
                                          tabTitle: 'Process'
                                       }));
                                       body.doLayout();

                                    } else if (panel.formMode == 'outbox') {
                                       body.removeAll();
                                       body.add(new Senate.InboxTab({
                                          mainBody: body,
                                          act: 'load-outbox',
                                          tabTitle: 'Outbox'
                                       }));
                                       body.doLayout();
                                    } else if (panel.tempInbox) {
                                       body.removeAll();
                                       body.add(new Senate.VerifyPanel(panel.tempInbox));
                                       body.doLayout();
                                    }
                                    /*else if (getParameter('fmID')) {
                                    window.close();
                                    }*/
                                    else if (getParameter('fmID') && parent && parent.id == 'body-panel') {
                                       window.close();
                                    } else {
                                       var parent = panel.parentPage;
                                       var body = panel.mainBody;

                                       parent.removeAll();
                                       parent.add(new Senate.MainForm({
                                          fmID: refFm,
                                          parentPage: parent,
                                          mainBody: body
                                       }));
                                       parent.doLayout();
                                    }
                                 }

                                 if (get_formMode() == 2 || get_formMode() == 1) {
                                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to leave this page?', function(btn) {
                                       if (btn == 'yes')
                                          back();
                                    });
                                    return false;
                                 }
                                 back();
                                 break;
                              }
                           }
                        }
                     }));

                     if (cells.mcFuncID == Senate.cm.Print || cells.mcFuncID == Senate.cm.PrintDraft) {
                        tbar.add(new Ext.Button({
                           repId: cells.repId,
                           repCause: cells.repCause,
                           text: cells.lbName + ' (Excel)',
                           mcName: cells.mcName + '_excel',
                           handler: function(btn) {
                              var printFn = function(open) {
                                 var url = Senate.url.Print + '?rid=' + btn.repId + '&key=' + btn.repCause + '&pid=' + panel.pID + '&type=excel' + '&docno=' + Ext.getCmp('main-form').getForm().findField('DOCNO').getValue();

                                 if (!open) {
                                    window.location = url;
                                 } else {
                                    window.open(url);
                                 }
                              }

                              if (panel.evList[Senate.ev.BeforePrint]) {
                                 debug(panel.evList[Senate.ev.BeforePrint], {
                                    mcName: btn.mcName,
                                    print: printFn,
                                    type: 'excel'
                                 });
                              } else {
                                 printFn();
                              }
                           }
                        }));
                     }

                     if (cells.mcFuncID == Senate.cm.Filter) {
                        tbar.add(new Ext.Button({
                           text: 'Clear',
                           handler: function(btn) {
                              panel.getForm().reset();
                              panel.runFilter(true);
                           }
                        }));
                     }
                  }
               }

               tbar.add(new Ext.Button({
                  text: 'Void Reason',
                  hidden: true,
                  handler: function() {
                     var grid = panel.filterGrid;
                     var row = grid.getSelectionModel().getSelected().data;

                     var docId = row['DocID'] ? row['DocID'] : row['DOCID'];
                     var docType = row['DocType'] ? row['DocType'] : row['DOCTYPE'];

                     load_data({
                           sql: 'select voidtext from tvoidvoucher where docid = :docid and doctype = :doctype',
                           params: [{
                                 name: 'docid',
                                 value: docId
                              },
                              {
                                 name: 'doctype',
                                 value: docType
                              }
                           ]
                        },
                        function(data) {
                           show_info(data, 'Void Reason');
                        });
                  }
               }));
               tbar.doLayout();
               body.doLayout();
            }

            panel.loadedComd = true;
            if (panel.loadedForm && panel.loadedComd) {
               panel.hideLoading(body);
            }

            if (evList[Senate.ev.MenuLoad]) {
               debug(evList[Senate.ev.MenuLoad]);
            }
         }
      });
   },

   pushDetail: function(grid) {
      this.details.push(grid);
   },

   hideLoading: function(body) {
      var combos = this.findByType('combo');
      var finish = true;
      for (var i = 0; i < combos.length; i++) {
         if (combos[i].loadCheck) {
            finish = false;
            break;
         }
      }

      if (finish) {
         body.hideLoading();
         var bd = Ext.getCmp('body-panel');
         if (bd && bd.mask) {
            bd.mask.hide();
         }

         if (!this.formLoaded && this.loadedComd && this.evList[Senate.ev.FormLoad]) {
            //console.log('>> form load');
            this.formLoaded = true;
            debug(this.evList[Senate.ev.FormLoad]);
            this.formFinished = true;
         }
      }
   }
});

function showError(msg, title) {
   if (title == undefined) {
      title = 'Internal Error';
   }
   Ext.Msg.show({
      title: title,
      msg: msg,
      icon: Ext.Msg.ERROR,
      buttons: Ext.Msg.OK
   });
}

function showMessage(msg, title) {
   if (title == undefined) {
      title = 'Message';
   }
   Ext.Msg.show({
      title: title,
      msg: msg,
      icon: Ext.Msg.INFO,
      buttons: Ext.Msg.OK
   });
}

function loadForm(panel, pID, body, pk) {
   var keys = '';
   for (var i = 0; i < panel.dataFields.length; i++) {
      var field = panel.getForm().findField(panel.dataFields[i]);
      if (field != null && field.getName().indexOf('fdName-') == -1) {
         keys += field.getName() + '|';
      }
   }

   var dets = '';
   for (var i = 0; i < panel.details.length; i++) {
      dets += panel.details[i].detKey + ':';

      var cm = panel.details[i].getColumnModel();
      dets += panel.details[i].tbID + ':';

      for (var j = 0; j < cm.getColumnCount(); j++) {
         if (cm.getDataIndex(j) != undefined) {
            dets += cm.getDataIndex(j) + ':';
         }
      }
      dets += '|';
   }

   //    var tbID;
   //    if (!panel.getForm().findField('TBID')) {
   //        tbID = 942;
   //    }
   //    else {
   //        tbID = panel.getForm().findField('TBID').getValue();
   //    }

   Ext.Ajax.request({
      url: Senate.url.Load,
      method: 'POST',
      params: {
         pID: pID,
         pk: pk,
         keys: keys,
         dets: dets,
         tbID: panel.getForm().findField('TBID').getValue()
      },
      success: function(response) {
         var json = Ext.util.JSON.decode(response.responseText);

         if (!json.success) {
            showError(json.errMessage);
         } else {
            var data = json.data;
            var form = panel.getForm();
            for (var i = 0; i < data.length; i++) {
               var rec = data[i];
               var field = form.findField(rec.field);
               if (field != null) {
                  if (rec.value != null && rec.value != 'null') {
                     if (field.attach) {
                        // Set file attachment value

                        var div = document.createElement('div');
                        div.innerHTML = rec.value;
                        var elm = div.firstChild;
                        var com = Ext.getCmp('com-' + field.id);
                        var di = null;
                        if (elm != null) {
                           di = elm != null ? elm.rel : null;
                           if (!di) {
							   var dir = elm.attributes['dir'];
								 if(dir != undefined)
									di = elm.attributes['dir'].value;
								else
									di = rec.value;
                           }
                        }
                        if (di != null) {
                           var fstr = di.split('|');
                           var size = 0;
                           if (fstr.length > 2) {
                              size = fstr[2];
                           }
                           com.updateFile(fstr[1], fstr[0], size);
                        } else {
                           var fstr = rec.value.split('|');
                           var size = 0;
                           if (fstr.length > 2) {
                              size = fstr[2];
                           }
                           com.updateFile(fstr[1], fstr[0], size);
                        }
                        /*var com = Ext.getCmp('com-' + field.id);
                        var fstr = rec.value.split('|');
                        var size = 0;
                        if (fstr.length > 2) {
                            size = fstr[2];
                        }
                        com.updateFile(fstr[1], fstr[0], size);
                        */
                     } else if (field.tfType == Senate.tf.DateTime || field.tfType == Senate.tf.Time) {
                        var dstr = rec.value;

                        // [ASP.NET begin]
                        var date = Date.parseDate(dstr, 'd/m/Y H:i:s');
                        if (!date) {
                           date = Date.parseDate(dstr, 'd/m/Y');
                        }
                        field.setValue(date);
                        // [end]

                        // [J2EE begin]
                        //								var dt = dstr.substring(0, dstr.lastIndexOf('.'));
                        //								field.setValue(Date.parseDate(dt, 'd/m/Y H:i:s'));
                        // [end]
                     } else if (field.getXType() == 'numberfield' || field.getXType() == 'numberfield3') {
                        field.setValue(rec.value);
                        field.fireEvent('blur', field);
                     } else if (field.hidField) {
                        field.setValue(rec.value);
                        field.fireEvent('change', field);
                     } else if (field.linkId != undefined) {
                        field.setValue(rec.value);
                        Ext.getCmp(field.linkId).setValue(rec.value);
                     } else if (field.getXType() == 'combo') {
                        field.setValue(rec.value);
                        field.getStore().setBaseParam('cmbValue', rec.value);
                        field.getStore().load();
                     } else {
                        if (panel.isCopy) {
                           if (rec.field != 'DocType' && rec.field != 'DocNo') {
                              field.setValue(rec.value);
                           }
                        } else {
                           field.setValue(rec.value);
                        }
                     }
                  }
               }
            }

            var details = json.details;
            if (details != null) {
               for (var i = 0; i < details.length; i++) {
                  // [J2EE begin]
                  //						panel.details[i].store.loadData(details[i]);
                  // [end]

                  // [ASP.NET begin]
                  if (details[i]) {
                     panel.details[i].store.loadData(Ext.util.JSON.decode(details[i]));

                     var grid = panel.details[i];
                     if (grid.fdType == Senate.fd.GridEditor) {
                        var store = grid.store;
                        var cm = grid.getColumnModel();
                        var dateCols = [];
                        for (var j = 0; j < cm.getColumnCount(); j++) {
                           var col = cm.getColumnAt(j);
                           if (col.tfType == Senate.tf.DateTime) {
                              dateCols.push(col.dataIndex);
                           }
                        }

                        if (dateCols.length > 0) {
                           for (var j = 0; j < store.getCount(); j++) {
                              var rec = store.getAt(j);
                              for (var k = 0; k < dateCols.length; k++) {
                                 var fieldName = dateCols[k];
                                 var dstr = rec.get(fieldName);
                                 var date = Date.parseDate(dstr, 'd/m/Y H:i:s');
                                 if (!date) {
                                    date = Date.parseDate(dstr, 'd/m/Y');
                                 }
                                 rec.set(fieldName, date);
                              }
                           }
                           store.commitChanges();
                        }
                     }
                  }
                  // [end]
               }
            }
         }

         panel.loadedForm = true;
         if (get_field('Approved') && !get_value('Approved')) {
            var items = Ext.getCmp('main-form').mainBody.getTopToolbar().items;
            for (var i = 0; i < items.length; i++) {
               var btn = items.get(i);
               if (btn.mcFuncID == Senate.cm.SendMail) {
                  btn.hide();
               }
            }
         }

         // hide loading
         if (panel.loadedForm && panel.loadedComd) {
            panel.hideLoading(body);
         }

         //			if (panel.isInbox) {
         //				panel.collapse();
         //			}
      }
   });
}
 
function validationForm(form, p = null) {
		var fItems = form.items;
		var blankColumn = null;
		var blankField = null;
		var errorMsg = null;
		var errorItem = null;
		for (var i = 0; i < fItems.length; i++) {
			var item = fItems.get(i);
			errorItem = item;
			var type = item.getXType();
			if (type == 'textfield' || type == 'textarea') {
				var val = item.getValue();
				if (val) {
					item.setValue(val.toString().trim());
				}
			}
			else if (type == 'compositefield') { // Begin - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
				var val = item.items.items[1].value;
				try {
					if (item.allowBlank != undefined) {
						if (!item.allowBlank) {
							blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
							if (!val) {
								if (!blankField) {
									blankField = 'กรุณากรอกข้อมูล ' + blankField;
								}
								break;
							} else {
								blankField = undefined;
							}
						}
					}
				} catch {}
			} // End - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
	
			if (!item.isValid() && item.fieldLabel != undefined) {
				if (!item.hidden) {
					blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
					if (blankField) break;
				} else if (item.getXType() == 'numberfield' || item.getXType() == 'numberfield3') {
					blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
					if (blankField) break;
				}
			} 
			else if (item.markError) {
				errorMsg = item.markError;
			}
		}
		if (errorItem){
			errorItem.clearInvalid();
		}
		
		if(p && !blankField){debugger;
			errorItem = null;
			var details = p.details;
			for (var i = 0; i < details.length; i++) {
				if (!details[i].isReadOnly) {
					if(blankField != null) break;
					var cols = [];
					var cm = details[i].getColumnModel();
					for (var j = 0; j < cm.getColumnCount(); j++) {
						var col = cm.getColumnAt(j);
						if(col.isRequire && Number(col.isRequire) == 1) cols.push(cm.getDataIndex(j) + '|' + cm.getColumnHeader(j) );
					}

					var store = details[i].getStore();
					//if(store.getCount() == 0 && cols.length > 0) blankField = Ext.getCmp('page-tab').mainBody.pageTitle + details[i].lbName == null || details[i].lbName == undefined ? null : + ', ' + details[i].lbName ;
					for (var j = 0; j < store.getCount(); j++) {
						if(blankField != null) break;
						var rec = store.getAt(j);
						for (var k = 0; k < cols.length; k++) {
							var d = cols[k].split('|');
							
							if (rec.get(d[0]) == undefined) {
								blankField = Ext.getCmp('page-tab').mainBody.pageTitle + ', ' + (Senate.winID == 'main-form' ? ', Seq: '  + rec.get('Seq') : (rec.get('Seq')  ? details[i].lbName +  ', Seq: '  + rec.get('Seq') : '') ) + ' -> ' +  d[1];
								break;
							} 
							else {
								var s = rec.get(d[0]) || null;
								if(s == null) {
									blankField = Ext.getCmp('page-tab').mainBody.pageTitle + ', ' + (Senate.winID == 'main-form' ? ', Seq: '  + rec.get('Seq') : (rec.get('Seq')  ? details[i].lbName +  ', Seq: '  + rec.get('Seq') : '') ) + ' -> ' +  d[1];
									//blankField = 'Quotation Detail -> Order: ' + rec.get('ISeq') + ', ' +  details[i].lbName + ' -> Seq: ' + (rec.get('rseq') ? rec.get('rseq') + ' -> No.: ' + rec.get('Seq') : rec.get('Seq'))  + ' -> ' + d[1];
									break;
								}
							}
						}
					}
				}
			}
		}
	  
		if (!form.isValid() || blankField) {
			showError('กรุณากรอกข้อมูล "' + blankField + '"', 'ข้อความ');
			if(errorItem) errorItem.markInvalid();
			return false;
		}
		if (errorMsg) {
			showError(errorMsg, 'ข้อความ');
			if(errorItem) errorItem.markInvalid();
			return false;
		}
		return true; 
   }
 
function saveForm(panel, callback, sp) {
	/*
   var fItems = panel.getForm().items;
   var blankField = null;
   var errorMsg = null;
   for (var i = 0; i < fItems.length; i++) {
      var item = fItems.get(i);

      var type = item.getXType();
      if (type == 'textfield' || type == 'textarea') {
         var val = item.getValue();
         if (val) {
            item.setValue(val.toString().trim());
         }
      }
      // Begin - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
      else if (type == 'compositefield') {
         var val = item.items.items[1].value;
         try { ////;
            if (item.allowBlank != undefined) {
               if (!item.allowBlank) {
                  blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
                  if (!val) {
                     if (!blankField) blankField = 'กรุณากรอกข้อมูล "Attach File"';
                     break;
                  } else {
                     blankField = undefined;
                  }
               }
            }
         } catch {}
      }
      // End - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false

      if (!item.isValid() && item.fieldLabel != undefined && !item.hidden) {
         blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
         break;
      } else if (item.markError) {
         errorMsg = item.markError;
         break;
      }
   }

   if (!panel.getForm().isValid() || blankField) {
      showError('กรุณากรอกข้อมูล "' + blankField + '"', 'ข้อความ');
      return;
   }
   if (panel.checkList && panel.checkList.length > 0) {
      var requireCheck = panel.checkList[0].msg;
      showError('กรุณากดปุ่ม "' + requireCheck + '"', 'ข้อความ');
      return;
   }
   if (errorMsg) {
      showError(errorMsg, 'ข้อความ');
      return;
   }
*/
	var isValid = validationForm(panel.getForm(), panel);
	if (!isValid) return;

   var funcID = Senate.cm.Save;
   if (panel.pID != undefined && !panel.isCopy) {
      funcID = Senate.cm.Edit;
   }

   var fileStr = '';
   var files = panel.hiddenFiles;
   for (f in files) {
      if (typeof files[f] == 'string') {
         fileStr += files[f] + '|';
      }
   }

   // Generate detail
   var dtJson = [];
   var details = panel.details;
   for (var i = 0; i < details.length; i++) {
      if (!details[i].isReadOnly) {
         var tb = {};
         tb['table'] = details[i].tbName;

         // [J2EE begin]
         //			tb['remove'] = details[i].removeRows;
         // [end]			

         // [ASP.NET begin]
         tb['rem'] = details[i].removeRows;
         // [end]
         tb['edit'] = details[i].editRows;
         tb['pk'] = details[i].isPK;
         tb['running'] = details[i].isRunning;
         tb['max'] = details[i].isMax;
         tb['rel'] = details[i].relString;

         var cols = [];
         var cm = details[i].getColumnModel();
         for (var j = 0; j < cm.getColumnCount(); j++) {
            cols.push(cm.getDataIndex(j));
         }

         var store = details[i].getStore();
         var data = null;
         var editData = null;
         for (var j = 0; j < store.getCount(); j++) {
            var rec = store.getAt(j);
            var rows = [];
            for (var k = 1; k < cols.length; k++) {
               if (rec.get(cols[k]) == undefined) {
                  rows.push('');
               } else {
                  var s = rec.get(cols[k]) + '';
                  if (s.match(/\<a.*\>.*\<\/[a]\>/i)) {
                     var div = document.createElement('div');
                     div.innerHTML = s;
                     var elm = div.firstChild;

                     var di = elm.rel;
                     if (!di) {
						 var dir = elm.attributes['dir'];
						 if(dir != undefined)
							di = elm.attributes['dir'].value;
						else
							di = s;
                     }
                     rows.push(di);
                  } else {
                     rows.push(rec.get(cols[k]));
                  }
               }
            }

            if (panel.pID > 0) {
               var isEdit = false;
               var isRemove = false;

               var mainKey = rec.get(tb['pk'][0]);
               var subKey = rec.get(tb['pk'][1]);
               if (mainKey) {
                  var keys = mainKey + ':';
                  if (subKey) {
                     keys += subKey;
                  } else {
                     keys += j;
                  }

                  for (var k = 0; k < tb['edit'].length; k++) {
                     if (tb['edit'][k] == keys) {
                        isEdit = true;
                        break;
                     }
                  }

                  //						if (!isEdit) {
                  //						    for (var k = 0; k < tb['rem'].length; k++) {
                  //							    if (tb['rem'][k] == keys) {
                  //								    isRemove = true;
                  //								    break;
                  //							    }
                  //						    }
                  //						}
               }

               if (isEdit) {
                  if (editData == null) {
                     editData = [];
                  }
                  editData.push(rows);
               }
               //					else if (isRemove) {
               //						if (removeData == null) {
               //							removeData = [];
               //						}
               //						removeData.push(rows);
               //					}
               else if (rec.get(tb['pk'][0]) == undefined || rec.get(tb['pk'][0]).length == 0) {
                  if (data == null) {
                     data = [];
                  }
                  data.push(rows);
               } else if ((rec.get(tb['pk'][0]) != undefined || Number(rec.get(tb['pk'][0])) > 0) 
									&& (rec.get(tb['pk'][1]) == undefined || rec.get(tb['pk'][1]).length == 0)
									&& tb['pk'].length > 1) {
                    if (data == null) {
                       data = [];
                    }
                    data.push(rows);
               }
            } else {
               if (data == null) {
                  data = [];
               }
               data.push(rows);
            }
         }
         tb['columns'] = cols;
         tb['data'] = data;
         tb['editData'] = editData;

         // [J2EE begin]
         //			var removeData = null;
         //			if (details[i].removeData.length > 0) {
         //				removeData = details[i].removeData;
         //			}
         //			tb['removeData'] = removeData;
         // [end]

         // [ASP.NET begin]

         // Begin - Apichart.S:20190301 - Fix Attach Link File json error
			if(details[i].removeData != undefined) {
				if (details[i].removeData.length > 0) {
					for (a = 0; a < details[i].removeData.length; a++) {
						for (b = 0; b < details[i].removeData[a].length; b++) {
							var val = details[i].removeData[a][b] + '';
							if (val.match(/\<a.*\>.*\<\/[a]\>/i)) {
								var div = document.createElement('div');
								div.innerHTML = val;
								var elm = div.firstChild;

								var di = elm.rel;
								if (!di) {
									var dir = elm.attributes['dir'];
									 if(dir != undefined)
										di = elm.attributes['dir'].value;
									else
										di = val;
								}
								details[i].removeData[a][b] = di;
							}
						}
					}
				}
			
				// 
				// End - Apichart.S:20190301 - Fix Attach Link File json error

				tb['removeData'] = details[i].removeData;
				//tb['removeData'] = remData;
				// [end]
			}
			
         dtJson.push(tb);
      }
   }

   if (!panel.isWindow) show_loading();
   panel.getForm().submit({
      url: Senate.url.Form,
      method: 'POST',
      timeout: 1800,
      params: {
         ActType: funcID,
         QueryType: panel.fmType,
         fileStr: fileStr,
         DT: Ext.util.JSON.encode(dtJson).replace('/-', '/N'),
         FMID: panel.fmID
      },
      success: function(form, result) {
         if (result.result.success) {
            function success() {
               panel.keyValue = result.result.keyValue;

               function finish() {
                  hide_loading();

                  /*var func;
                  if (getParameter('fmID')) {
                      func = function () {  };
                  }
                  else {
                      func = function () { callback(panel.keyValue) };
                  }*/
                  if (panel.formMode == 'process' && panel.btnclick == Senate.cm.SubmitToDF) {

                     Ext.Msg.show({
                        title: 'Success',
                        msg: 'Your data has been successfully saved',
                        icon: Ext.Msg.INFO,
                        buttons: Ext.Msg.OK,
                        fn: function() {
                           var parent = panel.parentPage;
                           var body = panel.mainBody;

                           body.removeAll();
                           body.add(new Senate.InboxTab({
                              mainBody: body,
                              act: 'load-process',
                              isProcess: true,
                              tabTitle: 'Process'
                           }));
                           body.doLayout();
                        }
                     });
                  } else {
                     var func = function() {
                        callback(panel.keyValue)
                     };

                     Ext.Msg.show({
                        title: 'Success',
                        msg: 'Your data has been successfully saved',
                        icon: Ext.Msg.INFO,
                        buttons: Ext.Msg.OK,
                        fn: func
                     });
                  }
               }

               if (sp) {
                  if (sp.spName) {
                     var inp = sp.spIn.split(/,\s+/);
                     var pp = new Array();
                     var pks = panel.getForm().findField('PK').getValue().split('|');
                     for (var i = 0; i < inp.length; i++) {
                        var pfunc = inp[i].split(':');

                        var pname = pfunc[0].substring(1);
                        var pval = null;
                        var ptype = 1;

                        if (pname.toLowerCase() == 'usid') {
                           pval = Senate.user.userId;
                        } else if (pname.toLowerCase() == 'fmid') {
                           pval = panel.fmID;
                        } else if (pname.toLowerCase() == pks[1].toLowerCase()) {
                           pval = pks[2];
                        } else {
                           var pfield = panel.getForm().findField(pname);
                           if (pfield) {
                              pval = pfield.getValue();
                              ptype = pfield.tfType;
                           } else {
                              show_info('Paramter "' + pname + '" not found');
                              return;
                           }
                        }

                        pp.push({
                           name: pfunc[1],
                           type: ptype,
                           value: pval
                        });
                     }

                     call_sp({
                        spName: sp.spName,
                        params: pp,
                        loading: false,
                     }, function(data) {
                        if (data.retCode > -1) {
                           if (panel.evList[Senate.ev.AfterSubmit]) {
                              //console.log('>> after invoke');
                              debug(panel.evList[Senate.ev.AfterSubmit], {
                                 callback: finish
                              });
                           } else {
                              finish();
                           }
                        } else {
                           show_error('Invoke SP "' + sp.spName + '" error: ' + data.retCode, 'call_sp', finish);
                        }
                     });
                  } else {
                     var dtField = panel.getForm().findField('DocType');
                     if (!dtField) {
                        dtField = panel.getForm().findField('DOCTYPE');
                        if (!dtField) {
                           show_error('Document type not found');
                           return;
                        }
                     }
                     var docType = dtField.getValue();

                     Ext.Ajax.request({
                        url: Senate.url.Form,
                        method: 'POST',
                        params: {
                           QueryType: 99,
                           SP: sp,
                           keyValue: panel.keyValue,
                           DocType: docType,
                           FMID: panel.fmID,
                           PK: form.findField('PK').getValue()
                        },
                        success: function(result) {
                           hide_loading();
                           var json = Ext.util.JSON.decode(result.responseText);
                           if (json.success) {
                              if (panel.evList[Senate.ev.AfterSubmit]) {
                                 //console.log('>> after submit: ' + Ext.util.JSON.decode(sp).spName);
                                 debug(panel.evList[Senate.ev.AfterSubmit], {
                                    callback: finish
                                 });
                              } else {
                                 finish();
                              }
                           } else {
                              showError(json.errMessage);
                           }

                        },
                        failure: function() {
                           hide_loading();
                           showError('Error, cannot call store procedure');
                        }
                     });
                  }
               } else {
                  finish();
               }
            }

            if (panel.evList[Senate.ev.AfterSave]) {
               //console.log('>> after save');
               panel.pID = result.result.keyValue;
               debug(panel.evList[Senate.ev.AfterSave], {
                  callback: success,
                  keyValue: result.result.keyValue
               });
            } else {
               success();
            }
         } else {
            showError(result.result.errMessage);
         }
      },
      failure: function(form, result) {
         if (!panel.isWindow) hide_loading();

         panel.keyValue = result.result.keyValue;
         if (sp && panel.keyValue) {
            showError(result.result.errMessage, 'Cannot be executed a store procedure', function() {
               var parent = panel.parentPage;

               parent.removeAll();
               parent.add(new Senate.MainForm({
                  pID: panel.keyValue,
                  fmID: panel.fmID,
                  refFm: panel.refFm,
                  parentPage: parent,
                  mainBody: panel.mainBody,
                  currentTab: panel.currentTab,
                  formMode: panel.formMode
               }));
               parent.doLayout();
            });
         } else {
			 if(Number(result.form.fmID) == 301514) {
					var errMsg = null;
					var errMsg = {},
						pairs = result.result.errMessage.split('ORA-'),
						d = decodeURIComponent,
						name,
						value;
				Ext.each(pairs, function(pair) {
					pair = pair.split(':');
					name = d(pair[0]);
					value = d(pair[1].replace('\n', ''));
					errMsg[name] = true || !errMsg[name] ? value :
								[].concat(errMsg[name]).concat(value);
				});
				show_info(errMsg[20000], 'Cannot be saved');
			 }
			 else  showError(result.result.errMessage, 'Cannot be saved');
         }
      }
   });
}

function getComp(id, cells, panel) {
   if (panel.pID > 0) {
      cells.defaultValue = null;
   }

   var blank = (!cells.isRequire) ? true : false;
   var hidden = (cells.visible || cells.visible == null) ? false : true;
   var label = cells.lbName;
   if (!blank) {
      label = '<b style="color: #3B5998">' + label + '</b>';
   }
   var style = '';
   var align = cells.alignment;
   switch (align) {
      case 1: {
         style += 'text-align: center;';
         break;
      }
      case 2: {
         style += 'text-align: right;';
         break;
      }
   }

   var tabIndex = panel.tabIndex;

   switch (cells.fdType) {
      case Senate.fd.TextField: {
         if (cells.defaultValue == '@WSID') cells.defaultValue = Senate.user.ws;
         else if (cells.defaultValue == '@CTID') cells.defaultValue = Senate.user.ct;
         else if (cells.defaultValue == '@MMID') cells.defaultValue = Senate.user.mm;
         else if (cells.defaultValue == '@USID') cells.defaultValue = Senate.user.userId;

         panel.tabIndex++;

         return new Ext.form.TextField({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            value: cells.defaultValue,
            style: style,
            //				scriptID: cells.scriptID,
            scriptText: cells.scriptText,
            autoCreate: autoCreate,

            calc: cells.calcExpr,
            calExpr: [],
            fdTarget: [],

            tabIndex: tabIndex,
            enableKeyEvents: true,

            listeners: {
               'blur': function(fd) {
                  calculate(panel, fd);

                  if (fd.scriptText) {
                     debug(fd.scriptText);
                  }

                  var txt = fd.getValue();
                  if (txt && cells.maxLength && txt.length > cells.maxLength) {
                     show_error('Your input is too long (Max ' + cells.maxLength + ' characters)', 'Problem', function() {
                        fd.setValue(txt.substring(0, cells.maxLength));
                     });
                  }
               },
               'keypress': function(textfield, event) {
                  if (cells.maxLength) {
                     var key = event.keyCode;
                     if (key >= 33 || key == 13 || key == 32) {
                        var maxLength = cells.maxLength;
                        var length = textfield.getValue().length;
                        if (length >= maxLength) {
                           event.preventDefault();
                        }
                     }
                  }
               }
               /*,
               'added': function(fd) {
               	genExpr(panel, fd);
               }*/
            }
         });
      }
      case Senate.fd.TimeField: {
         panel.tabIndex++;

         return new Ext.form.TimeField({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            editable: false,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            value: cells.defaultValue,
            style: style,
            scriptText: cells.scriptText,

            calc: cells.calcExpr,
            calExpr: [],
            fdTarget: [],

            tabIndex: tabIndex,

            listeners: {
               'blur': function(fd) {
                  if (fd.scriptText) {
                     debug(fd.scriptText);
                  }
               }
            },

            minValue: '12:00 AM',
            maxValue: '11:50 PM',
            increment: 10
         });
      }
      case Senate.fd.Hidden: {
         if (cells.isPK) {
            return [new Ext.form.Hidden({
               id: 'primary-key-' + panel.fmID,
               name: 'PK',
               value: cells.tbName + '|' + cells.tfName
            }), new Ext.form.Hidden({
               id: 'table-key-' + panel.fmID,
               name: 'TBID',
               value: cells.tbID
            }), new Ext.form.Hidden({
               id: id,
               fieldLabel: cells.fieldLabel,
               name: cells.tfName,
               value: panel.pID
            })];
         } else {
            if (cells.defaultValue == '@WSID') cells.defaultValue = Senate.user.ws;
            else if (cells.defaultValue == '@CTID') cells.defaultValue = Senate.user.ct;
            else if (cells.defaultValue == '@MMID') cells.defaultValue = Senate.user.mm;
            else if (cells.defaultValue == '@USID') cells.defaultValue = Senate.user.userId;

            return new Ext.form.Hidden({
               id: id,
               tfType: cells.tfType,
               name: cells.tfName,
               value: cells.defaultValue
            });
         }
      }
      case Senate.fd.SelectOneField: {
         panel.tabIndex++;

         // Apichart.S - Support Voice 
         // Add Delete Data and Relate Text config in TARGETFD
         var delBtn = new Ext.Button({
            text: 'x',
            disabled: cells.isReadOnly || (cells.enable == 0),
            width: 15,
            hidden: false,
            handler: function() {
               linkText.setValue(null);
               linkText.el.dom.value = null;
               linkText.originalValue = null;
               linkText.startValue = null;
               try {
                  var frm = panel.getForm();
                  if (panel.isWindow) {
                     frm = Ext.getCmp('main-form').getForm();
                  }
                  if (panel.isViewForm) {
                     frm = Ext.getCmp('owin-form').items.get(0).getForm();
                  }
				  var fid = get_winData().winFid;
				  if(!(fid == 'main-form' || fid == 'owin-form')) frm = Ext.getCmp(fid).getForm();
				  
                  var FDs = linkText.targetFD.split('|');
                  for (var i = 0; i < FDs.length; i++) {
                     var field = FDs[i].split(':')[0];
                     var defaultValue = FDs[i].split(':').length > 1 ? FDs[i].split(':')[1] : null;
                     if (field == null) {
                        showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
                        break;
                     } else {
                        var ff = frm.findField(field);
                        if (!ff) {
                           ff = get_field(field);
                        }

                        if (ff == null && Ext.getCmp('win-form')) {
                           ff = Ext.getCmp('win-form').getForm().findField(field);
                        }

                        if (ff == null) {
                           ff = Ext.getCmp(field);
                           if (ff == null) {
                              showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
                              break;
                           }
                        }

                        if (ff.getValue() == null || (ff.getValue() + '').length == 0) {
                           switch (ff.tfType) {
                              case 1:
                                 ff.setValue(defaultValue != null ? defaultValue : 0);
                                 ff.el.dom.value = defaultValue;
                                 break;
                              case 2:
								 if(ff.attach){
									 var link = ff.ownerCt.items.items[2];
									 link.update(null);
									 ff.setValue(null);
                                 }else ff.setValue(defaultValue != null ? defaultValue : '');
                                 break;
                              case 6:
                                 ff.setValue(defaultValue != null ? defaultValue : 0);
                                 break;
                              default:
                                 ff.setValue(defaultValue != null ? defaultValue : null);
                           }
                        } else {
                           switch (ff.tfType) {
                              case 1:
                                 ff.setValue(defaultValue != null ? defaultValue : 0);
                                 ff.el.dom.value = defaultValue;
                                 break;
                              case 2:
								if(ff.attach){
									 var link = ff.ownerCt.items.items[2];
									 link.update(null);
									 ff.setValue(null);
                                 }else ff.setValue(defaultValue != null ? defaultValue : '');
                                 break;
                              case 6:
                                 ff.setValue(defaultValue != null ? defaultValue : 0);
                                 break;
                              default:
                                 ff.setValue(defaultValue != null ? defaultValue : null);
                           }
                        }
                     }
                  }
               } catch {}

            }
         });

         var refBtn = new Ext.Button({
            text: '...',
            cfmID: cells.cfmID,
            srcValues: cells.srcValues,
            //disabled: cells.isReadOnly || (cells.enable == 0),
            scriptText: cells.scriptText,
            //style: 'position: absolute; right: 5px; top: 0;',
            hidden: false,
            margins: '0 0 0 5',
            handler: function(btn) {
               var srcValues = btn.srcValues;
               var valid = true;
               var params = '';
               if (srcValues != null) {
                  var frm = panel.getForm();
                  if (panel.isWindow) {
                     frm = Ext.getCmp('main-form').getForm();
                  }
                  if (panel.isViewForm) {
                     frm = Ext.getCmp('owin-form').items.get(0).getForm();
                  }
                  var vals = srcValues.split('|');
                  for (var i = 0; i < vals.length; i++) {
                     var field = vals[i].substring(1);
                     if (field == null) {
                        showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
                        valid = false;
                        break;
                     } else {
                        var ff = frm.findField(field);
                        if (!ff) {
                           ff = get_field(field);
                        }

                        if (ff == null && Ext.getCmp('win-form')) {
                           ff = Ext.getCmp('win-form').getForm().findField(field);
                        }

                        if (ff == null) {
                           showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
                           valid = false;
                           break;
                        } else if (ff.getValue() == null || (ff.getValue() + '').length == 0) {
                           showError('กรุณากรอกข้อมูล "' + ff.fieldLabel.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
                           valid = false;
                           break;
                        } else {
                           params += (field + ':' + ff.getValue(0) + '|');
                        }
                     }
                  }
               }

               if (valid) {
                  var win = new Senate.FormWindow();
                  if (panel.isWindow) {
                     win.id = 'form-popup';
                  }
                  win.showFilter(btn.cfmID, panel, params, btn.scriptText);
               }
            }
         });


         //			return new Ext.form.CompositeField({
         //				fieldLabel: label,
         //				hidden: hidden,
         //                items: [
         //                	new Ext.form.TextField({
         //                		flex: 1,
         //						id: id,
         //						tfType: cells.tfType,
         //						name: cells.tfName,
         //						allowBlank: blank, 
         //						anchor: '100%',
         //						readOnly: cells.isReadOnly || (cells.enable == 0),
         //						value: cells.defaultValue,
         //						style: style,
         //						tabIndex: tabIndex,
         //						refBtn: refBtn
         //					}), 
         //					refBtn
         //                ]
         //			});

         //            return [
         //                	new Ext.form.TextField({
         //                		fieldLabel: label,
         //						id: id,
         //						tfType: cells.tfType,
         //						name: cells.tfName,
         //						allowBlank: blank, 
         //						anchor: '100%',
         //						readOnly: cells.isReadOnly || (cells.enable == 0),
         //						value: cells.defaultValue,
         //						style: style,
         //						tabIndex: tabIndex,
         //						refBtn: refBtn
         //					}), 
         //					refBtn
         //            ];

         var linkId = 'selone-' + id;

         // Apichart.S - Support Voice 
         // Add Ref Panel for refBtn and delBtn
         var refPanel = new Ext.Panel({
            border: false,
            width: 31,
            disabled: cells.isReadOnly || (cells.enable == 0),
            layout: 'column',
            margins: '0 0 0 3',
            items: [refBtn, delBtn]
         });

         // Add linkText and refPanel
         var linkText = new Ext.form.TextField({
            flex: 1,
            id: id,
            lid: linkId,
            tfType: cells.tfType,
            fieldLabel: label,
            name: cells.tfName,
            allowBlank: blank,
            targetFD: cells.targetFD,
            anchor: '100%',
            readOnly: true, //cells.isReadOnly || (cells.enable == 0),
            value: cells.defaultValue,
            style: style,
            tabIndex: tabIndex,
            refBtn: refPanel
         });

         // Add New Return
         var comp = new Ext.Panel({
            id: linkId,
            border: false,
            layout: 'hbox',
            fieldLabel: label,
            hidden: hidden,
            margins: '0 0 0 3',
            items: [
               linkText,
               refPanel
            ]
         });


         /* var comp = new Ext.Panel({
            id: linkId,
            border: false,
            layout: 'hbox',
            fieldLabel: label,
            hidden: hidden,
            items: [
					new Ext.form.TextField({
					    flex: 1,
					    id: id,
                        lid: linkId,
					    tfType: cells.tfType,
                        fieldLabel: label,
					    name: cells.tfName,
					    allowBlank: blank,
					    anchor: '100%',
					    readOnly: true, //cells.isReadOnly || (cells.enable == 0),
					    value: cells.defaultValue,
					    style: style,
					    tabIndex: tabIndex,
					    refBtn: refBtn
					}),
					refBtn
				]
        }); */

         return comp;
      }
      case Senate.fd.TextArea: {
         panel.tabIndex++;

         var textCreate = null;
         if (cells.maxLength) {
            textCreate = {
               tag: 'textarea',
               rows: '5',
               autocomplete: 'off',
               maxlength: cells.maxLength
            };
         }

         return new Ext.form.TextArea({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            hidden: hidden,
            allowBlank: blank,
            anchor: '100%',
            tabIndex: tabIndex,
            readOnly: cells.isReadOnly,
            value: cells.defaultValue,
            style: style,
            enableKeyEvents: true,
            listeners: {
               'blur': function(fd) {
                  var txt = fd.getValue();
                  if (txt && cells.maxLength && txt.length > cells.maxLength) {
                     show_error('Your input is too long (Max ' + cells.maxLength + ' characters)', 'Problem', function() {
                        fd.setValue(txt.substring(0, cells.maxLength));
                     });
                  }
               },
               'keypress': function(textfield, event, options) {
                  if (cells.maxLength) {
                     var key = event.keyCode;
                     if (key >= 33 || key == 13 || key == 32) {
                        var maxLength = cells.maxLength;
                        var length = textfield.getValue().length;
                        if (length >= maxLength) {
                           event.preventDefault();
                        }
                     }
                  }
               }
            }
         });
      }
      case Senate.fd.HtmlEditor: {
         panel.tabIndex++;

         return new Ext.form.HtmlEditor({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            hidden: hidden,
            allowBlank: blank,
            anchor: '100%',
            tabIndex: tabIndex,
            readOnly: cells.isReadOnly,
            value: cells.defaultValue,

            enableSourceEdit: true,
            enableLinks: false,

            plugins: [new Ext.form.HtmlEditor.Image(), new Ext.form.HtmlEditor.Preview()]
         });
      }
      case Senate.fd.NumberField: {
         panel.tabIndex++;

         var autoCreate = null;
         if (cells.maxLength) {
            autoCreate = {
               tag: 'input',
               type: 'text',
               size: '20',
               autocomplete: 'off',
               maxlength: cells.maxLength
            };
         }

         return new Ext.form.NumberField({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            allowDecimals: false,
            fieldLabel: label,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            tabIndex: tabIndex,
            value: cells.defaultValue,
            style: style,
            autoCreate: autoCreate,

            calc: cells.calcExpr,
            calExpr: [],
            fdTarget: [],

            scriptText: cells.scriptText,

            listeners: {
               'blur': function(fd) {
                  calculate(panel, fd);

                  if (fd.scriptText) {
                     debug(fd.scriptText);
                  }
               }
            }
         });
      }
      case Senate.fd.CurrencyField: {
         panel.tabIndex++;

         var autoCreate = null;
         if (cells.maxLength) {
            autoCreate = {
               tag: 'input',
               type: 'text',
               size: '20',
               autocomplete: 'off',
               maxlength: cells.maxLength
            };
         }

         var n = new Ext.form.NumberField({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            value: cells.defaultValue,
            style: style + ';text-align: right',
            tabIndex: tabIndex,
            autoCreate: autoCreate,

            calc: cells.calcExpr,
            calExpr: [],
            fdTarget: [],
            scriptText: cells.scriptText,

            listeners: {
               'blur': function(fd) {
                  calculate(panel, fd);

                  if (fd.scriptText) {
                     debug(fd.scriptText);
                  }

                  nBlur();
               }
            }
         });

         var t = new Ext.form.TextField({
            hidden: true,
            fieldLabel: label,
            readOnly: cells.isReadOnly,
            style: 'text-align: right',
            tabIndex: tabIndex,
            anchor: '100%',
            listeners: {
               'focus': function() {
                  tFocus();
               }
            }
         });

         n['refInput'] = t;
         var number = [n, t];

         function nBlur() {
            if (!hidden) {
               n.hide();
               t.show();

               var v = n.getValue();
               if (!isNaN(v)) {
                  t.setValue(Ext.util.Format.number(v, '0,000.00'));
               }
            }
         }

         function tFocus() {
            if (!n.readOnly) {
               n.show();
               n.focus();
               t.hide();
            }
         }

         if (cells.defaultValue) {
            nBlur();
         }

         return number;
      }
      case Senate.fd.DateBetween: {
         panel.tabIndex = tabIndex + 2;

         var hid = new Ext.form.Hidden({
            id: id,
            fdType: Senate.fd.DateBetween,
            tfType: cells.tfType,
            name: cells.tfName
         });

         var d2 = new Ext.form.DateField({
            cls: (cells.isReadOnly != 1) ? 'white-field' : '',
            flex: 1,
            editable: false,
            format: 'd/m/Y',
            tabIndex: tabIndex + 1,
            style: style,
            listeners: {
               'select': function(df, d) {
                  var hval = hid.getValue() + '';
                  if (hval == undefined) {
                     hval = '';
                  }

                  if (d == undefined) {
                     d = '';
                  }

                  var sp = hval.split('!');
                  if (sp.length < 0) {
                     hid.setValue('!' + d);
                  } else {
                     hid.setValue(sp[0] + '!' + d);
                  }
               },
               'blur': function(df, d) {
                  if (!df.getValue()) {
                     var hval = hid.getValue();
                     if (hval == undefined) {
                        hval = '';
                     }

                     d = '';
                     var sp = hval.split('!');
                     if (sp.length < 0) {
                        hid.setValue('!' + d);
                     } else {
                        hid.setValue(sp[0] + '!' + d);
                     }
                  }
               }
            }
         });

         return [hid, new Ext.form.CompositeField({
            id: 'comp_' + id,
            fieldLabel: cells.lbName,
            items: [

               new Ext.form.DateField({
                  cls: (cells.isReadOnly != 1) ? 'white-field' : '',
                  flex: 1,
                  editable: false,
                  format: 'd/m/Y',
                  tabIndex: tabIndex,
                  style: style,
                  listeners: {
                     'select': function(df, d) {
                        var hval = hid.getValue();
                        if (hval == undefined) {
                           hval = '';
                        }

                        if (d == undefined) {
                           d = '';
                        }

                        var sp = hval.split('!');
                        if (sp.length < 2) {
                           hid.setValue(d + '!');
                        } else {
                           hid.setValue(d + '!' + sp[1]);
                        }

                        d2.setValue(d);
                        hid.setValue(d + '!' + d2.getValue());
                     },
                     'blur': function(df, d) {
                        if (!df.getValue()) {
                           var hval = hid.getValue();
                           if (hval == undefined) {
                              hval = '';
                           }

                           d = '';
                           var sp = hval.split('!');
                           if (sp.length < 2) {
                              hid.setValue(d + '!');
                           } else {
                              hid.setValue(d + '!' + sp[1]);
                           }
                        }
                     }
                  }
               }), {
                  xtype: 'displayfield',
                  value: '-'

               },
               d2
            ]
         })];
      }
      case Senate.fd.TextBetween: {
         panel.tabIndex = tabIndex + 2;

         var hid = new Ext.form.Hidden({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName
         });

         return [hid, new Ext.form.CompositeField({
            fieldLabel: cells.lbName,
            items: [
               new Ext.form.TextField({
                  flex: 1,
                  tabIndex: tabIndex,
                  style: style,
                  listeners: {
                     'blur': function(f) {
                        var hval = hid.getValue();
                        if (hval == undefined) {
                           hval = '';
                        }

                        var sp = hval.split('!');
                        if (sp.length < 2) {
                           hid.setValue(f.getValue() + '!');
                        } else {
                           hid.setValue(f.getValue() + '!' + sp[1]);
                        }
                     }
                  }
               }), {
                  xtype: 'displayfield',
                  value: '-'
               },
               new Ext.form.TextField({
                  flex: 1,
                  tabIndex: tabIndex + 1,
                  style: style,
                  listeners: {
                     'blur': function(f) {
                        var hval = hid.getValue() + '';
                        if (hval == undefined) {
                           hval = '';
                        }

                        var sp = hval.split('!');
                        if (sp.length < 0) {
                           hid.setValue('!' + f.getValue());
                        } else {
                           hid.setValue(sp[0] + '!' + f.getValue());
                        }
                     }
                  }
               })
            ]
         })];
      }

      case Senate.fd.ComboBoxBetween: {
         panel.tabIndex = tabIndex + 2;

         var hid = new Ext.form.Hidden({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName
         });

         var combo1 =
            new Ext.form.ComboBox({
               id: 'cmb1_' + id,
               flex: 1,
               tabIndex: tabIndex,
               style: style,

               typeAhead: true,
               triggerAction: 'all',
               store: new Ext.data.Store({
                  comboId: 'cmb1_' + id,
                  baseParams: {
                     tbID: parseInt(cells.ctbID),
                     srcParams: panel.srcParams
                  },
                  autoLoad: true,
                  proxy: new Ext.data.HttpProxy({
                     method: 'GET',
                     url: Senate.url.Combo,
                     success: function(result) {}
                  }),
                  reader: new Ext.data.ArrayReader({
                     root: 'data'
                  }, [{
                        name: 'id'
                     },
                     {
                        name: 'name'
                     }
                  ]),
                  listeners: {
                     'load': function(store) {
                        var cmb = Ext.getCmp(store.comboId);
                        cmb.loadCheck = null;
                        panel.hideLoading(panel.mainBody);
                     }
                  }
               }),
               listeners: {
                  'select': function(f) {
                     var hval = hid.getValue();
                     if (hval == undefined) {
                        hval = '';
                     }

                     var sp = hval.split('!');
                     if (sp.length < 2) {
                        hid.setValue(f.getValue() + '!');
                     } else {
                        hid.setValue(f.getValue() + '!' + sp[1]);
                     }
                  }
               },
               mode: 'local',
               valueField: 'id',
               displayField: 'name'
            });

         var combo2 =
            new Ext.form.ComboBox({
               id: 'cmb2_' + id,
               flex: 1,
               tabIndex: tabIndex + 1,
               style: style,

               typeAhead: true,
               triggerAction: 'all',
               store: new Ext.data.Store({
                  comboId: 'cmb2_' + id,
                  baseParams: {
                     tbID: parseInt(cells.ctbID),
                     srcParams: panel.srcParams
                  },
                  autoLoad: true,
                  proxy: new Ext.data.HttpProxy({
                     method: 'GET',
                     url: Senate.url.Combo,
                     success: function(result) {}
                  }),
                  reader: new Ext.data.ArrayReader({
                     root: 'data'
                  }, [{
                        name: 'id'
                     },
                     {
                        name: 'name'
                     }
                  ]),
                  listeners: {
                     'load': function(store) {
                        var cmb = Ext.getCmp(store.comboId);
                        cmb.loadCheck = null;
                        panel.hideLoading(panel.mainBody);
                     }
                  }
               }),
               listeners: {
                  'select': function(f) {
                     var hval = hid.getValue() + '';
                     if (hval == undefined) {
                        hval = '';
                     }

                     var sp = hval.split('!');
                     if (sp.length < 0) {
                        hid.setValue('!' + f.getValue());
                     } else {
                        hid.setValue(sp[0] + '!' + f.getValue());
                     }
                  }
               },
               mode: 'local',
               valueField: 'id',
               displayField: 'name'
            });

         return [hid, new Ext.form.CompositeField({
            fieldLabel: cells.lbName,
            items: [
               combo1, {
                  xtype: 'displayfield',
                  value: '-'
               },
               combo2
            ]
         })];
      }

      case Senate.fd.PasswordField: {
         panel.tabIndex++;

         return new Ext.form.TextField({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: cells.lbName,
            inputType: 'password',
            hidden: (cells.visible || cells.visible == null) ? false : true,
            tabIndex: tabIndex,
            anchor: '100%',
            style: style
         });
      }
      case Senate.fd.FileField: {
         panel.tabIndex++;

         var hid = new Ext.form.Hidden({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            attach: true
         });

         var link = new Ext.Panel({
            bodyStyle: 'margin-left: 10px; line-height: 22px;',
            html: ''
         });

         var upFile = new Ext.ux.form.FileUploadField({
            buttonOnly: true,
            buttonText: 'Attach',
            attachFile: cells.tfName,
            tabIndex: tabIndex,
            listeners: {
				'fileselected': function(fb, v) {
					var fp = panel;
					fp.getForm().fileUpload = true;
					fp.getForm().submit({
						clientValidation: false,
						method: 'POST',
						url: Senate.url.Upload,
						success: function(f, result) {
							fb.reset();
							fp.getForm().fileUpload = false;

							var data = result.result;
							if (data.success) {
								var items = data.items[0];

								comp.updateFile(items.fileName, items.filePath, items.fileSize);
								comp.clearInvalid();
								
								if (panel.isWindow) {
									fp = Ext.getCmp('main-form');
									fp.hiddenFiles[upFile.attachFile + '-' + fp.currentRow] = items.sysName;
								} else {
									fp.hiddenFiles[upFile.attachFile] = items.sysName;
								}
							}else{
								// Begin - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
								try {
									if (comp.allowBlank != undefined) {
										var val = comp.value;
										if (!comp.allowBlank) {
											blankField = comp.fieldLabel.replace(/(<([^>]+)>)/ig, '');
											if (!val) {
												if (!blankField) blankField = comp.fieldLabel.replace(/(<([^>]+)>)/ig, '');
											} else {
												blankField = undefined;
											}
											showError('กรุณากรอกข้อมูล "' + blankField + '"', 'ข้อความ');
											comp.markInvalid();
										}
									}else{
										comp.clearInvalid();
									}
								} catch {}
							}
						}
                  });
               }
            }
         });
         if (cells.isReadOnly) {
            upFile.setDisabled(true);
         }

         var upPanel = new Ext.Panel({
            items: upFile
         });

         var delFile = new Ext.Button({
			text: 'Remove',
            hidden: true,
            items: [link, hid],
            handler: function() {
               link.update('');
               hid.setValue(''); // Apichart.S:20190301 - Clear Attach File when click remove button
               delFile.hide();
               upPanel.show();
               // Begin - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
               try {
				   if (comp.allowBlank != undefined) {
						var val = comp.value;
						if (!comp.allowBlank) {
							blankField = comp.fieldLabel.replace(/(<([^>]+)>)/ig, '');
							if (!val) {
								if (!blankField) blankField = comp.fieldLabel.replace(/(<([^>]+)>)/ig, '');
							} else {
								blankField = undefined;
							}
							showError('กรุณากรอกข้อมูล "' + blankField + '"', 'ข้อความ');
							comp.markInvalid();
						}
					}else{
						comp.clearInvalid();
					}
				} catch {;}
			}
            // End - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
         });

		var comp = new Ext.form.CompositeField({
			id: 'com-' + id,
            fieldLabel: cells.lbName,
            allowBlank: (!cells.isRequire) ? true : false,
            items: [upPanel, delFile, link, hid],
            updateFile: function(fileName, filePath, fileSize) {
 				if (filePath.search('HREF') == -1) {
					var url = Senate.url.Download + '?name=' + fileName + '&path=' + filePath;
					link.update('<a href="' + url + '">' + fileName + ' - ' + Ext.util.Format.fileSize(fileSize) + '</a>');
					var fileValue = filePath.replace(/\/temp/, '') + '|' + fileName + '|' + fileSize;
					hid.setValue(fileValue);

					upPanel.hide();
					delFile.show();
				}else{
					link.update(filePath);
					hid.setValue(filePath);
					
					upPanel.hide();
					delFile.hide();
				} 
			}
		});
		
		return comp;
      }
      case Senate.fd.ImageField: {
         panel.tabIndex++;

         var hid = new Ext.form.Hidden({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            attach: true
         });

         var link = new Ext.Panel({
            bodyStyle: 'margin-top: 5px',
            html: ''
         });

         var upFile = new Ext.ux.form.FileUploadField({
            buttonOnly: true,
            buttonText: 'Attach',
            attachFile: cells.tfName,
            tabIndex: tabIndex,
            listeners: {
               'fileselected': function(fb, v) {
                  var fp = panel;

                  fp.getForm().fileUpload = true;
                  fp.getForm().submit({
                     clientValidation: false,
                     method: 'POST',
                     url: Senate.url.Upload,
                     success: function(f, result) {
                        fb.reset();
                        fp.getForm().fileUpload = false;

                        var data = result.result;
                        if (data.success) {
                           var items = data.items[0];

                           comp.updateFile(items.fileName, items.filePath, items.fileSize);

                           if (panel.isWindow) {
                              fp = Ext.getCmp('main-form');
                              fp.hiddenFiles[upFile.attachFile + '-' + fp.currentRow] = items.sysName;
                           } else {
                              fp.hiddenFiles[upFile.attachFile] = items.sysName;
                           }
                        }
                     }
                  });
               }
            }
         });
         if (cells.isReadOnly) {
            upFile.setDisabled(true);
         }

         var upPanel = new Ext.Panel({
            items: upFile
         });

         var delFile = new Ext.Button({
            text: 'Remove',
            refPanel: null,
            hidden: true,
            handler: function() {
               delFile.refPanel.setHeight(22);
               link.update('');
               delFile.hide();
               upPanel.show();
            }
         });

         var comp = new Ext.Panel({
            id: 'com-' + id,
            fieldLabel: cells.lbName,
            items: [upPanel, delFile, link, hid],
            updateFile: function(fileName, filePath, fileSize) {
               if (fileName) {
                  fileName = fileName.replace('?type=img', '');
                  var url = Senate.url.Download + '?name=' + fileName + '&path=' + filePath;

                  comp.setHeight(300);
                  link.update('<img style="max-height: 300px" src="' + url + '" alt="' + fileName + '"/>');

                  var fileValue = filePath.replace(/\/temp/, '') + '|' + fileName + '|' + fileSize + '?type=img';
                  hid.setValue(fileValue);

                  upPanel.hide();

                  if (!panel.viewMode) {
                     delFile.show();
                     delFile.refPanel = comp;
                  }
               }else{
				   if (filePath.search('HREF') == -1) {
						fileName = fileName.replace('?type=img', '');
						  var url = Senate.url.Download + '?name=' + fileName + '&path=' + filePath;

						  comp.setHeight(300);
						  link.update('<img style="max-height: 300px" src="' + url + '" alt="' + fileName + '"/>');

						  var fileValue = filePath.replace(/\/temp/, '') + '|' + fileName + '|' + fileSize + '?type=img';
						  hid.setValue(fileValue);

						  upPanel.hide();

						  if (!panel.viewMode) {
							 delFile.show();
							 delFile.refPanel = comp;
						  }
					}else{
						link.update(filePath);
						hid.setValue(filePath);
						
						upPanel.hide();
						delFile.hide();
					} 
			   }
            }
         });

         return comp;
      }
      case Senate.fd.CheckBox: {
         panel.tabIndex++;

         var text = cells.lbName.split('|');
         var label = text[0];
         var box = '';
         if (text.length > 1) {
            box = text[1];
         }

         if (cells.defaultValue == null) {
            cells.defaultValue = false;
         }

         var linkId = '';
         if (cells.tfName) {
            linkId = id + '-chk-' + cells.tfName;
         } else {
            linkId = 'chk-' + id;
         }

         var hid = new Ext.form.Hidden({
            id: id,
            name: cells.tfName,
            linkId: linkId,
            tfType: cells.tfType,
            value: cells.defaultValue
         });

         return [hid, new Ext.form.Checkbox({
            id: hid.linkId,
            fieldLabel: label,
            hidden: hidden,
            boxLabel: box,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            value: cells.defaultValue,
            disabled: (cells.enable == 0 || cells.isReadOnly),
            tabIndex: tabIndex,
            checked: (cells.defaultValue == 1),

            scriptText: cells.scriptText,

            listeners: {
               'check': function(c, chk) {
                  hid.setValue(chk);

                  if (c.scriptText) {
                     debug(c.scriptText);
                  }
               }
            }
         })];
      }
      case Senate.fd.ComboBox: {
         panel.tabIndex++;

         if (cells.defaultValue == '@WSID') cells.defaultValue = Senate.user.ws;
         else if (cells.defaultValue == '@CTID') cells.defaultValue = Senate.user.ct;
         else if (cells.defaultValue == '@MMID') cells.defaultValue = Senate.user.mm;
         else if (cells.defaultValue == '@USID') cells.defaultValue = Senate.user.userId;

         var hid = new Ext.form.Hidden({
            ctfName: cells.ctfName
         });
         var combo = new Ext.form.ComboBox({
            id: id,
            tfType: cells.tfType,
            hiddenName: cells.tfName,
            fieldLabel: label,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            scriptText: cells.scriptText,
            tabIndex: tabIndex,

            loadCheck: true && cells.ctbID,

            refField: hid,
            value: (cells.defaultValue) ? parseInt(cells.defaultValue) : undefined,
            defaultValue: (cells.defaultValue) ? parseInt(cells.defaultValue) : undefined,

            typeAhead: true,
            triggerAction: 'all',
            store: new Ext.data.Store({
               comboId: id,
               baseParams: {
                  tbID: parseInt(cells.ctbID),
                  srcParams: panel.srcParams
               },
               autoLoad: !(panel.pID && cells.tbID && cells.refColumn),
               proxy: new Ext.data.HttpProxy({
                  method: 'GET',
                  url: Senate.url.Combo,
                  success: function(result) {
                     var json = Ext.util.JSON.decode(result.responseText);
                     if (!json.success) {
                        //showError(json.errMessage, 'ComboBox');
                        //console.log('ComboBox: ' + json.errMessage);
                     }
                  }
               }),
               reader: new Ext.data.ArrayReader({
                  root: 'data'
               }, [{
                     name: 'id'
                  },
                  {
                     name: 'name'
                  }
               ]),
               listeners: {
                  'load': function(store) {
                     var cmb = Ext.getCmp(store.comboId);
                     if (cmb) {
                        if (cmb.getValue()) {
                           cmb.setValue(cmb.getValue());
                        } else {
                           cmb.setValue(cmb.defaultValue);
                        }
                        hid.setValue(cmb.getValue());
                     }

                     if (cmb)
                        cmb.loadCheck = null;

                     panel.hideLoading(panel.mainBody);

                     //			            	if (cmb != undefined) {
                     //				            	if (cmb.defaultValue == '@WSID') cmb.setValue(Senate.user.ws);
                     //								else if (cmb.defaultValue == '@CTID') cmb.setValue(Senate.user.ct);
                     //								else if (cmb.defaultValue == '@MMID') cmb.setValue(Senate.user.mm);
                     //								else if (cmb.defaultValue == '@USID') cmb.setValue(Senate.user.userId);
                     //								else {
                     //				            		cmb.setValue(cmb.getValue());								
                     //								}
                     //			            	}
                  }
               }
            }),
            listeners: {
               'blur': function(cmb) {
                  if (!panel.filterForm && typeof cmb.getValue() == 'string' && !cmb.getValue().match(/\<.*\>/ig) && cmb.getValue()) {
                     var label = cmb.fieldLabel.replace(/(<([^>]+)>)/ig, '');
                     show_info('"' + label + '" not found', 'Alert', function() {
                        cmb.reset();
                     });
                  }
               },
               'select': function(cmb) {
                  hid.setValue(cmb.getValue());

                  if (cmb.scriptText) {
                     debug(cmb.scriptText);
                  }
               }
            },
            mode: 'local',
            valueField: 'id',
            displayField: 'name'
         });

         if (cells.ctfName != null) {
            return [combo, hid];
         }
         return combo;
      }
      case Senate.fd.DateField: {
         panel.tabIndex++;

         if (cells.defaultValue == '@DATE') {
            cells.defaultValue = new Date();
         }

         return new Ext.form.DateField({
            cls: (cells.isReadOnly != 1) ? 'white-field' : '',
            id: id,
            editable: false,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            tabIndex: tabIndex,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            format: 'd/m/Y',
            value: cells.defaultValue,
            style: style,

            scriptText: cells.scriptText,

            listeners: {
               'select': function(fd) {
                  if (fd.scriptText) {
                     debug(fd.scriptText);
                  }
               }
            }
         });
      }
      case Senate.fd.MonthField: {
         panel.tabIndex++;

         if (cells.defaultValue == '@DATE') {
            cells.defaultValue = new Date();
         }

         return new Ext.form.MonthField({
            cls: (cells.isReadOnly != 1) ? 'white-field' : '',
            id: id,
            editable: false,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            tabIndex: tabIndex,
            hidden: hidden,
            allowBlank: blank,
            readOnly: cells.isReadOnly,
            anchor: '100%',
            format: 'M-Y',
            value: cells.defaultValue,
            style: style,

            scriptText: cells.scriptText,

            listeners: {
               'select': function(fd) {
                  if (fd.scriptText) {
                     debug(fd.scriptText);
                  }
               }
            }
         });
      }
      case Senate.fd.Radio: {
         panel.tabIndex++;

         var text = cells.lbName.split('|');
         var label = '';
         var box = '';
         if (text.length > 1) {
            label = text[0];
            box = text[1];
         } else {
            box = text[0];
         }

         return new Ext.form.Radio({
            id: id,
            tfType: cells.tfType,
            name: cells.tfName,
            fieldLabel: label,
            tabIndex: tabIndex,
            hidden: (cells.visible || cells.visible == null) ? false : true,
            boxLabel: box,
            anchor: '100%'
         });
      }
      case Senate.fd.Button: {
         panel.tabIndex++;

         var txtLabel = cells.lbName;
         if (cells.isRequire) {
            txtLabel = '<b style="color: #3B5998">' + txtLabel + '</b>';
         }

         var btn = new Ext.Button({
            id: id,
            text: txtLabel,
            //				ctData: cells,
            tabIndex: tabIndex,
            scriptText: cells.scriptText,
            hidden: hidden,
            isRequire: cells.isRequire,

            handler: function(btn) {
               if (btn.isRequire) {
                  for (var i = 0; i < panel.checkList.length; i++) {
                     var item = panel.checkList[i];
                     if (item.id == btn.id) {
                        panel.checkList.splice(i, 1);
                        btn.isRequire = false;
                        break;
                     }
                  }
               }

               if (cells.scriptText) {
                  debug(cells.scriptText);
               }
            }
         });

         if (cells.width) {
            btn.width = cells.width;
         }

         if (cells.isRequire) {
            panel.checkList.push({
               id: btn.id,
               msg: btn.text
            });
         }

         return btn;
      }
   };

   return new Ext.form.Hidden();
}

function genExpr(panel, fd) {
   if (fd.calc != null) {
      var frm = panel.getForm();
      var calc = fd.calc;
      var rep = fd.calc;

      while (rep.indexOf('sum{') > -1) {
         var ff = rep.substring(rep.indexOf('sum{'), rep.indexOf('}') + 1);
         rep = rep.replace(ff, '');
         var spVal = ff.substring(4, ff.length - 1).split('.');
         var grid = Ext.getCmp(panel.fmID + '-grid-' + spVal[0]);

         if (grid) {
            grid.calExpr.push(calc);
            grid.fdTarget.push(fd);
         }
      }
      while (rep.indexOf('count{') > -1) {
         var ff = rep.substring(rep.indexOf('count{'), rep.indexOf('}') + 1);
         rep = rep.replace(ff, '');
         var spVal = ff.substring(6, ff.length - 1).split('.');
         var grid = Ext.getCmp(panel.fmID + '-grid-' + spVal[0]);

         if (grid) {
            grid.calExpr.push(calc);
            grid.fdTarget.push(fd);
         }
      }
      while (rep.indexOf('{') > -1) {
         var ff = rep.substring(rep.indexOf('{'), rep.indexOf('}') + 1);
         rep = rep.replace(ff, '');
         var fid = panel.fmID + '-fdName-' + ff.substring(1, ff.length - 1);

         if (panel.isWindow) {
            fid = 'w' + fid;
         }

         var field = frm.findField(fid);

         if (field != null) {
            field.calExpr.push(calc);
            field.fdTarget.push(fd);
         }
      }
   }
}

function calculate(panel, fd) {
   for (var i = 0; i < fd.calExpr.length; i++) {
      var frm = panel.getForm();
      var rep = fd.calExpr[i];
      var calc = fd.calExpr[i];
      while (rep.indexOf('sum{') > -1) {
         var ff = rep.substring(rep.indexOf('sum{'), rep.indexOf('}') + 1);
         rep = rep.replace(ff, '');
         var spVal = ff.substring(4, ff.length - 1).split('.');
         var grid = Ext.getCmp(panel.fmID + '-grid-' + spVal[0]);

         if (grid) {
            var cm = grid.getColumnModel();
            var col = cm.getColumnById('col-' + spVal[1]);
            if (col) {
               var store = grid.getStore();
               var sum = 0;
               for (var j = 0; j < store.getCount(); j++) {
                  var rec = store.getAt(j);
                  var val = rec.get(col.dataIndex);
                  if (val != null) {
                     sum += parseFloat(val);
                  }
               }
               calc = calc.replace(ff, sum);
            }
         }
      }

      while (rep.indexOf('count{') > -1) {
         var ff = rep.substring(rep.indexOf('count{'), rep.indexOf('}') + 1);
         rep = rep.replace(ff, '');
         var spVal = ff.substring(6, ff.length - 1).split('.');
         var grid = Ext.getCmp(panel.fmID + '-grid-' + spVal[0]);

         if (grid) {
            calc = calc.replace(ff, grid.getStore().getCount());
         }
      }

      while (rep.indexOf('{') > -1) {
         var ff = rep.substring(rep.indexOf('{'), rep.indexOf('}') + 1);
         rep = rep.replace(ff, '');
         var fid = panel.fmID + '-fdName-' + ff.substring(1, ff.length - 1);

         if (panel.isWindow) {
            fid = 'w' + fid;
         }

         var field = frm.findField(fid);
         if (field != null) {
            calc = calc.replace(ff, field.getValue());
         }
      }

      var result = null;
      try {
         result = calculator.parse(calc);
      } catch (e) {
         //			showError(e.message);
      }

      if (fd.fdTarget[i] != null) {
         fd.fdTarget[i].setValue(result);
         fd.fireEvent('blur', fd.fdTarget[i]);

         fd.fdTarget[i].fireEvent('blur', fd.fdTarget[i]);

         calculate(panel, fd.fdTarget[i]);
      }
   }
}

function activeColumn(val, metaData, r) {
   if (!val || val == 0) {
      //return '<input type="checkbox" disabled="disabled">';
      return '<img src="resources/css/images/icons/uncheck.gif"/>';
   } else {
      //return '<input type="checkbox" checked="checked" disabled="disabled">';
      var dataIndex = this.dataIndex.toUpperCase();
      if (dataIndex == 'APPROVED') {
         return '<img src="resources/css/images/icons/approve.gif"/>';
      } else if (dataIndex == 'VOIDSTATUS') {
         return '<img src="resources/css/images/icons/void.gif"/>';
      } else if (dataIndex == 'ISHOLD') {
         return '<img src="resources/css/images/icons/void.gif"/>';
      }
      return '<img src="resources/css/images/icons/check.gif"/>';
   }
}

function timeColumn(val) {
   if (new Date(val) == 'Invalid Time') {
      return val;
   } else {
      return Ext.util.Format.date(val, 'g:i A');
   }
}

function dateColumn(val) {
   if (!val) {
      return val;
   }

   var vals = [];
   try {
      vals = val.split(' ');
   } catch (e) {
      vals[0] = new Date(val).format('d/m/Y');
   }

   if (vals.length == 0) {
      return val;
   } else {
      return vals[0];
   };
}

function currencyColumn(val) {
   if (!isNaN(val)) {
      return Ext.util.Format.number(val, '0,000.00');
   } else {
      return 0.00;
   }
}

function getGenerateForm(panel, data) {
   var tabPage = new Array();
   var tabPanel = new Array();
   var filterForm = new Array();
   var layoutPanel = new Array();
   var fieldSet = new Array();
   var gridPanel = new Array();
   var columns = new Array();
   var fields = new Array();
   var filters = new Array();
   var chart = new Array();

   var tabIndex = 100;

   for (var i = 0; i < data.length; i++) {
      var cells = data[i];

      if (panel.viewMode) {
         cells.isReadOnly = true;
      }
      var hidden = (cells.visible || cells.visible == null) ? false : true;

      if (cells.gfmID) {
         var gfmArr = [];
         var spBtn = cells.gfmID.split('|');
         if (spBtn.length > 1) {
            for (var j = 0; j < spBtn.length; j++) {
               var spLbl = spBtn[j].split(':');
					if (spLbl.length > 1) {
						gfmArr.push({
							gfmID: spLbl[0],
							gfmLbl: spLbl[1]
						});
					}
				}
			}
			else {
				var spLbl = cells.gfmID.split(':');
				if (spLbl.length > 1) {
					gfmArr.push({
						gfmID: spLbl[0],
						gfmLbl: spLbl[1]
					});
				}
         }

         cells.gfmArr = gfmArr;
      }

      var conId = panel.fmID + '-fdName-' + cells.fdName;
      if (panel.isWindow) {
         conId = 'w' + conId;
      }

      if (cells.fdType == Senate.fd.Tab) {
         tabPage[cells.fdID] = new Ext.TabPanel({
			id: conId,
            border: false,
            frame: true,
            enableTabScroll: true,
            listeners: {
               'tabchange': function(tabPanel, t) {
                  /*for (var g = 0; g < panel.details.length; g++) {
                      console.log(panel.details[g].isBuffer);
                  }*/
               }
            }
         });
         panel.add(tabPage[cells.fdID]);
      } else if (cells.fdType == Senate.fd.TabPanel) {
         tabPanel[cells.fdID] = new Ext.Panel({
            id: conId,
            title: cells.lbName,
            frame: true,
            autoScroll: true,
            autoHeight: true,
				defaultValue: cells.defaultValue,
            listeners: {
               activate: function(p) {
                  if (panel.loadedForm && panel.loadedComd) {
                     var scroller = Ext.query('.x-grid3-scroller', p.el.dom);
                     if (scroller.length > 0) {
                        scroller[0].scrollTop = 1;
                        scroller[0].scrollTop = 0;
                        scroller[0].scrollLeft = 1;
                        scroller[0].scrollLeft = 0;
                     }
                  }
               }
            }
         });
         tabPage[cells.pfdID].add(tabPanel[cells.fdID]);
      } else if (cells.fdType == Senate.fd.FilterForm) {
         filterForm[cells.fdID] = new Ext.Panel({
            title: cells.lbName,
            style: 'margin-bottom: 5px',
            frame: true,
            collapsible: true,
            animCollapse: false,
            dataFields: []
         });
         panel.filterForm = filterForm[cells.fdID];
         panel.add(filterForm[cells.fdID]);
      } else if (cells.fdType == Senate.fd.FieldSet) {
         fieldSet[cells.fdID] = new Ext.form.FieldSet({
            id: conId,
            title: cells.lbName,
            hidden: hidden,
            collapsed: cells.collapse,
            collapsible: true,
            autoHeight: true
         });

         if (tabPanel[cells.pfdID] != undefined) {
            tabPanel[cells.pfdID].add(fieldSet[cells.fdID]);
         } else {
            panel.add(fieldSet[cells.fdID]);
         }
      } else if (cells.fdType == Senate.fd.LayoutPanel) {
         var items = [];
         if (cells.fdColumn == 0) {
            var key = cells.fdID + '-0';
            layoutPanel[key] = new Ext.Panel({
               columnWidth: (cells.fdColumn == 0) ? 1 : (1 / cells.fdColumn),
               layout: (cells.fdColumn == 0) ? 'fit' : 'form',
               border: false,

               items: []
            });
            items.push(layoutPanel[key]);
         } else {
            var colCode = cells.fdColumn.split('|');
            cells.fdColumn = colCode[0];

            var sum = 0;
            for (var j = 0; j < cells.fdColumn; j++) {
               var colWidth = (1 / cells.fdColumn);
               if (cells.fdColumn == 0) {
                  colWidth = 1;
               } else if (colCode.length > 1) {
                  var perWidth = colCode[1];
                  colWidth = (perWidth.split(':')[j] / 100);
               }
               sum += colWidth;

               var key = cells.fdID + '-' + j;

               var jsonLayout = {
                  columnWidth: colWidth,
                  layout: (cells.fdColumn == 0) ? 'fit' : 'form',
                  border: false,
                  html: '<img src="resources/css/images/pixel.gif" />',

                  items: []
               };
               if (cells.alignment == 1) {
                  jsonLayout.layout = 'hbox';
                  jsonLayout.layoutConfig = {
                     pack: 'center',
                     align: 'middle'
                  };
               }

               layoutPanel[key] = new Ext.Panel(jsonLayout);
               items.push(layoutPanel[key]);
            }

            if (cells.alignment == 2) {
               var diff = (1.0 - sum);
               if (diff > 0) {
                  items.splice(0, 0, new Ext.Panel({
                     columnWidth: diff,
                     html: '<img src="resources/css/images/pixel.gif" />'
                  }));
               }
            }
         }

         var layout = new Ext.Panel({
            layout: 'column',
            border: false,
            //				style: 'border: solid 1px green',
            //				html: '<span style="color: red;">' + cells.fdName + ', ' + cells.fdColumn+ '</span>',
            defaults: {
               labelWidth: 120,
               padding: '0px 5px 0px 5px'
            },

            items: items
         });

         if (tabPanel[cells.pfdID] != undefined) {
            tabPanel[cells.pfdID].add(layout);
         } else if (filterForm[cells.pfdID] != undefined) {
            filterForm[cells.pfdID].add(layout);
         } else if (fieldSet[cells.pfdID] != undefined) {
            fieldSet[cells.pfdID].add(layout);
         } else {
            panel.add(layout);
         }
      } else if (cells.fdType == Senate.fd.IFrame) {
         var url = cells.defaultValue;
         if (url) {
            var pid = -1;
            if (panel.pID) {
               pid = panel.pID;
            }

            url = url.replace('@USID', Senate.user.userId);
            url = url.replace('@PID', pid);

            var iframe = new Ext.Panel({
               layout: 'fit',
               border: false,
               bodyCfg: {
                  tag: 'iframe',
                  src: url,
                  style: {
                     border: '0px none',
                     width: '100%',
                     height: '550px'
                  }
               }
            });

            if (tabPanel[cells.pfdID] != undefined) {
               tabPanel[cells.pfdID].add(iframe);
            } else {
               panel.add(iframe);
            }
         }
      } else if (cells.fdType == Senate.fd.Calendar) {
         var today = new Date().clearTime();
         var eventStore = new Ext.data.JsonStore({
            id: 'eventStore',
            root: 'data',
            proxy: new Ext.data.MemoryProxy(),
            fields: Ext.calendar.EventRecord.prototype.fields.getRange()
         });

         var myCalendar = new Ext.calendar.CalendarPanel({
            id: panel.fmID + '-fdName-' + cells.fdName,

            eventStore: eventStore,

            activeItem: 2, // month view
            height: 500,
            region: 'center',

            monthViewCfg: {
               showHeader: true,
               showWeekLinks: true,
               showWeekNumbers: true
            },

            showNavBar: true,
            showTodayText: false,
            showTime: false,
            title: 'My Calendar',

            initComponent: function() {
               this.constructor.prototype.initComponent.apply(this, arguments);
            },

            showLoading: function() {
               this.mask = new Ext.LoadMask(myCalendar.el, {
                  msg: 'Please wait...'
               });
               this.mask.show();
            },

            hideLoading: function() {
               this.mask.hide();
            },

            listeners: {
               'eventclick': {
                  fn: function(vw, rec, el) {
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
                  fn: function(p, vw, dateInfo) {
                     if (dateInfo) {
                        var startDt = dateInfo.viewStart;
                        var endDt = dateInfo.viewEnd;
                        var p = myCalendar;

                        if (startDt.clearTime().getTime() == endDt.clearTime().getTime()) {
                           p.setTitle(startDt.format('F j, Y'));
                        } else if (startDt.getFullYear() == endDt.getFullYear()) {
                           if (startDt.getMonth() == endDt.getMonth()) {
                              p.setTitle(startDt.format('F j') + ' - ' + endDt.format('j, Y'));
                           } else {
                              p.setTitle(startDt.format('F j') + ' - ' + endDt.format('F j, Y'));
                           }
                        } else {
                           p.setTitle(startDt.format('F j, Y') + ' - ' + endDt.format('F j, Y'));
                        }

                        p.setTitle('<div style="text-align: center;">' + p.title + '</div>');
                     }
                  },
                  scope: this
               }
            }
         });

         if (tabPanel[cells.pfdID] != undefined) {
            tabPanel[cells.pfdID].add(myCalendar);
         } else {
            panel.add(myCalendar);
         }

         /*Ext.Ajax.request({
		        url: Senate.url.Core,
		        method: 'POST',
		        params: { act: 'load_data', tbID: 2001, params: '' },
		        success: function(result, r) {
                    var json = Ext.util.JSON.decode(result.responseText);
                    var evData = new Array();
                    var dt = json.data;
                    for (var i = 0; i < dt.length; i++) {
                        var rec = dt[i];
                        evData.push({
                            id: rec.CID,
                            title: rec.Title,
                            start: Date.parseDate(rec.SDate, 'd/m/Y H:i:s'),
                            end: Date.parseDate(rec.EDate, 'd/m/Y H:i:s'),
                            cid: rec.CType,
                            ad: true
                        });
                    }
                    console.log(evData);
		            eventStore.loadData({ data: evData });
		        }
		    });*/
      } else if (cells.fdType == Senate.fd.GridPanel) {
         columns[cells.fdID] = [];
         fields[cells.fdID] = [];

         var jsonGrid = {
            id: panel.fmID + '-grid-' + cells.fdName,
            hidden: hidden,
            stripeRows: true,
            store: {},
            calExpr: [],
            fdTarget: [],
            colModel: new Ext.grid.ColumnModel([]),

            //				autoHeight: (cells.pixelColumn != 1)? true: false,
            //				viewConfig: { forceFit: (cells.pixelColumn != 1)? true: false },
            //				bodyStyle: 'overflow-x: scroll',
            //				height: 535,

            isBuffer: cells.buffer,
            autoHeight: (cells.pixelColumn != 1 && !cells.buffer) ? true : false,
            viewConfig: {
               forceFit: (cells.pixelColumn != 1 && !cells.buffer) ? true : false
            },
            bodyStyle: 'overflow-x: scroll',
            height: 535,

            tbar: new Ext.Toolbar({
               hidden: true
            }),
            selModel: new Ext.grid.RowSelectionModel({
               singleSelect: true,
               hideButton: null,
               listeners: {
                  'rowselect': function(sm, index, r) {
                     var grid = sm.grid;
                     grid.keyValue = r.get(grid.pk);

                     if (r.get('DYN_FMID')) {
                        grid.dynFmID = r.get('DYN_FMID');
                     } else {
                        grid.dynFmID = undefined;
                     }

                     if (r.get('VoidStatus') || r.get('VOIDSTATUS') ||
                        r.get('DFDocNo') || r.get('DFDOCNO') ||
                        r.get('Approved') || r.get('APPROVED')) {
							
								var tbar = panel.mainBody.getTopToolbar();
								for (var i = 0; i < tbar.items.length; i++) {
									if (tbar.get(i).mcFuncID == Senate.cm.EditForm) {
										tbar.get(i).setVisible(false);
										sm.hideButton = tbar.get(i);
									}
									if (r.get('VoidStatus') || r.get('VOIDSTATUS') ||
										 r.get('Approved') || r.get('APPROVED')) {
										if (tbar.get(i).mcName == 'Recall') {
											tbar.get(i).setVisible(false);
										}	
									}else if(r.get('DFDocNo') || r.get('DFDOCNO')){
										if (tbar.get(i).mcName == 'Recall') {
											tbar.get(i).setVisible(true);
										}
									}
								}
                     } else if (sm.hideButton != null) {
								sm.hideButton.setVisible(true);
								var tbar = panel.mainBody.getTopToolbar();
								for (var i = 0; i < tbar.items.length; i++) {
									if (tbar.get(i).mcName == 'Recall') {
										tbar.get(i).setVisible(false);
									}
								}
                     }else{
								var tbar = panel.mainBody.getTopToolbar();
								for (var i = 0; i < tbar.items.length; i++) {
									if (tbar.get(i).mcName == 'Recall') {
										tbar.get(i).setVisible(false);
									}
								}
							}

                     if (r.get('VoidStatus') || r.get('VOIDSTATUS')) {
                        grid.voidStatus = true;
                     }

                     var tbar = panel.mainBody.getTopToolbar();
                     if (r.get('VoidStatus') || r.get('VOIDSTATUS')) {
                        tbar.items.get(tbar.items.length - 1).show();
                     } else {
                        tbar.items.get(tbar.items.length - 1).hide();
                     }
                  }
               }
            }),

            fdType: cells.fdType,
            tbID: cells.tbID,
            tbName: cells.tbName,
            tbOrder: cells.tbOrder,
            cfmID: cells.cfmID,
            excel: cells.exportExcel,
            viewForm: cells.viewForm,
            addForm: cells.addForm,

            plugins: []
         };

         if (cells.isGroup) {
            jsonGrid['view'] = new Ext.grid.GroupingView({
               forceFit: (cells.pixelColumn != 1) ? true : false,
               groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
            });
            jsonGrid['plugins'].push(new Ext.ux.grid.GroupSummary());
            jsonGrid['groupCol'] = true;
         } else if (cells.buffer) {
            jsonGrid['view'] = new Ext.ux.grid.BufferView({
               rowHeight: 20,
               scrollDelay: false
            });
         } else {
            jsonGrid['bbar'] = new Ext.PagingToolbar({
               pageSize: 20,
               displayInfo: true,
               displayMsg: 'Displaying results {0} - {1} of {2}',
               emptyMsg: "No results to display"
            });
         }

         gridPanel[cells.fdID] = new Ext.grid.GridPanel(jsonGrid);

         panel.filterGrid = gridPanel[cells.fdID];

         layoutPanel[cells.pfdID + '-0'].items.add(gridPanel[cells.fdID]);
      } else if (cells.fdType == Senate.fd.GridEditor) {
         columns[cells.fdID] = [];
         fields[cells.fdID] = [];
         filters[cells.fdID] = [];

         var jsonGrid = {
            id: panel.fmID + '-grid-' + cells.fdName,
            fdName: cells.fdName,
            calExpr: [],
            fdTarget: [],

            hidden: hidden,
            stripeRows: true,
            store: {},
            colModel: new Ext.grid.ColumnModel([]),

            isBuffer: cells.buffer,
            autoHeight: (cells.pixelColumn != 1 && !cells.buffer) ? true : false,
            viewConfig: {
               forceFit: (cells.pixelColumn != 1 && !cells.buffer) ? true : false
            },
            bodyStyle: 'overflow-x: scroll',
            height: 535,

            fdtype: cells.fdType,
            cfmID: cells.cfmID,
            gfmID: cells.gfmID,
            gfmArr: cells.gfmArr,
            lbName: cells.lbName,
            fmWidth: cells.fmWidth,
            fmHeight: cells.fmHeight,

            fdType: cells.fdType,
            tbID: cells.tbID,
            tbName: cells.tbName,
            removeRows: [],
            removeData: [],
            editRows: [],
            isPK: [],
            isRunning: [],
            isMax: [],
            isReadOnly: cells.isReadOnly,
            detKey: null,
            srcValues: cells.srcValues,
            clicksToEdit: 1,
            excel: cells.exportExcel,
            viewForm: cells.viewForm,
            addForm: cells.addForm,

            listeners: {
               'rowclick': function(grid, rowIndex) {
                  grid['selectedRow'] = grid.getStore().getAt(rowIndex);
               },
               'beforeedit': function(e) {
                  //						var grid = e.grid;
                  //						if (grid.groupCol) {
                  //							var gBtn = grid.getTopToolbar().get(1);
                  //		            		grid.getStore().clearGrouping();
                  //		            		gBtn.showGroup = true;
                  //		            		gBtn.setText('Show Group');
                  //						}

                  /*var cm = e.grid.getColumnModel(); 
                  var xtype = cm.getCellEditor(e.column, e.row).field.getXType()
                  if (xtype == 'datefield') {         
                      var val = e.value;
                      var vals = val.split(' ');
                      if (vals.length > 0) {
                          val = vals[0];
                      }                   
                      e.value = Date.parseDate(val, 'd/m/Y');
                      //cm.getCellEditor(e.column, e.row).field.setValue(e.value);
                  }*/
               },
               'validateedit': function(e) {
                  var cm = e.grid.getColumnModel();
                  var field = cm.getCellEditor(e.column, e.row).field;
                  if (field.ctfName != null) {
                     e.record.data[field.ctfName] = e.value;
                  }

                  var rec = e.record;
                  var pk = e.grid.isPK;
                  if (rec.get(pk[0]) && rec.get(pk[1])) {
                     e.grid.pushEditRows({
                        mainKey: rec.get(pk[0]),
                        subKey: rec.get(pk[1])
                     });
                  }

                  if (field.getXType() == 'datefield') {
                     //e.value = Date.parseDate(e.value, 'd/m/Y');
                     //e.value = e.value.format('d/m/Y'); 
                  }

                  var col = cm.getColumnById(cm.getColumnId(e.column));
                  var target = col.calTarget;
                  if (target) {
                     var calc = target.expr;
                     var rep = target.expr;
                     while (rep.indexOf('{') > -1) {
                        var ff = rep.substring(rep.indexOf('{'), rep.indexOf('}') + 1);
                        rep = rep.replace(ff, '');

                        var refCol = cm.getColumnById('col-' + ff.substring(1, ff.length - 1));

                        var value = null;
                        if (col.id == refCol.id) {
                           value = e.value;
                        } else {
                           value = e.record.data[refCol.dataIndex];
                        }

                        calc = calc.replace(ff, value);

                        //								if (refCol) {	
                        //									refCol.calTarget = {
                        //										dataIndex: col.dataIndex,
                        //										expr: col.calc
                        //									};
                        //								}
                     }

                     var result = null;
                     try {
                        result = calculator.parse(calc);
                        e.record.data[target.dataIndex] = result;
                     } catch (e) {
                        //								showError(e.message);
                     }
                  }
               }
            },

            tbar: [{
               id: 'addrec-' + panel.fmID + '-grid-' + cells.fdName,
               text: 'Add Record',
               hidden: true,
               handler: function(btn) {
                  var grid = this.ownerCt.ownerCt;

                  if (grid.groupCol) {
                     var gBtn = grid.getTopToolbar().get(1);
                     grid.getStore().clearGrouping();
                     gBtn.showGroup = true;
                     gBtn.setText('Show Group');
                  }

                  var Rec = grid.getStore().recordType;
                  var json = {};

                  var cm = grid.getColumnModel();
                  var startIndex = 1;
                  for (var i = 0; i < cm.getColumnCount(); i++) {
                     var dataIndex = cm.getDataIndex(i);
                     json[dataIndex] = null;

                     if (cm.getColumnById(cm.getColumnId(i)).isPK) {
                        startIndex++;
                     }
                  }
                  var r = new Rec(json);

                  grid.stopEditing();
                  grid.getStore().add(r);
                  grid.startEditing(grid.getStore().getCount() - 1, startIndex);
               }
            }, {
               text: 'Show Group',
               showGroup: true,
               hidden: true,
               handler: function(btn) {
                  var grid = this.ownerCt.ownerCt;

                  if (btn.showGroup) {
                     grid.getStore().groupBy(grid.groupCol);
                     btn.showGroup = false;
                     btn.setText('Hide Group');
                  } else {
                     grid.getStore().clearGrouping();
                     btn.showGroup = true;
                     btn.setText('Show Group');
                  }
               }
            }],
            //plugins: []

            plugins: [new Ext.ux.grid.GridFilters({
               encode: false,
               local: true
            })],

            view: null,
            groupCol: null,
            enableColumnHide: enableColumnHide,
            enableColumnResize: enableColumnResize,

            pushEditRows: function(data) {
               var key = data.fullKey;
               if (!key) {
                  key = data.mainKey + ':' + data.subKey;
                  if (!data.subKey) {
                     key = data.mainKey + ':' + data.rowIndex;
                  }
               }

               this.removeRows.remove(key);

               if (this.editRows.indexOf(key) == -1)
                  this.editRows.push(key);
            },

            pushRemoveRows: function(data) {
               var key = data.fullKey;
               if (!key && data.mainKey) {
                  key = data.mainKey + ':' + data.subKey;
                  if (!data.subKey) {
                     key = data.mainKey + ':' + data.rowIndex;
                  }

                  this.editRows.remove(key);

                  this.removeRows.push(key);

                  // Apichart.s - Fix json is undefined
                  if (data.record.json == undefined) {
                     var row = [];

                     var cm = this.getColumnModel();
                     for (var k = 1; k < cm.getColumnCount(); k++) {
                        row.push(data.record.get(cm.getDataIndex(k)));
                     }
                     this.removeData.push(row);
                  } else
                     this.removeData.push(data.record.json);
               }
            }
         };

         if (cells.isGroup) {
            jsonGrid['view'] = new Ext.grid.GroupingView({
               forceFit: (cells.pixelColumn != 1) ? true : false,
               groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
            });
            jsonGrid['plugins'].push(new Ext.ux.grid.GroupSummary());
            jsonGrid['groupCol'] = true;
         } else if (cells.buffer) {
            jsonGrid['view'] = new Ext.ux.grid.BufferView({
               rowHeight: 20,
               scrollDelay: false
            });
         }

         gridPanel[cells.fdID] = new Ext.grid.EditorGridPanel(jsonGrid);

         if (cells.isReadOnly) {
            gridPanel[cells.fdID].getTopToolbar().hide();
         }

         layoutPanel[cells.pfdID + '-0'].items.add(gridPanel[cells.fdID]);
      } else if (cells.fdType == Senate.fd.GridDetail) {
         columns[cells.fdID] = [];
         fields[cells.fdID] = [];

         var jsonGrid = {
            id: panel.fmID + '-grid-' + cells.fdName,
            fdName: cells.fdName,
            calExpr: [],
            fdTarget: [],

            hidden: hidden,
            stripeRows: true,
            store: {},
            colModel: new Ext.grid.ColumnModel([]),
            //				bbar: new Ext.Toolbar(),

            isBuffer: cells.buffer,
            autoHeight: (cells.pixelColumn != 1 && !cells.buffer) ? true : false,
            viewConfig: {
               forceFit: (cells.pixelColumn != 1 && !cells.buffer) ? true : false
            },
            bodyStyle: 'overflow-x: scroll',
            height: 535,

            fdtype: cells.fdType,
            cfmID: cells.cfmID,
            gfmID: cells.gfmID,
            gfmArr: cells.gfmArr,
            lbName: cells.lbName,
            fmWidth: cells.fmWidth,
            fmHeight: cells.fmHeight,
            excel: cells.exportExcel,
            viewForm: cells.viewForm,
            addForm: cells.addForm,
            tbar: [{
               text: 'Show Group',
               showGroup: true,
               hidden: true,
               handler: function(btn) {
                  var grid = this.ownerCt.ownerCt;

                  if (btn.showGroup) {
                     grid.getStore().groupBy(grid.groupCol);
                     btn.showGroup = false;
                     btn.setText('Hide Group');
                  } else {
                     grid.getStore().clearGrouping();
                     btn.showGroup = true;
                     btn.setText('Show Group');
                  }
               }
            }, {
               id: 'addrec-' + panel.fmID + '-grid-' + cells.fdName,
               text: 'Add Record',
               hidden: (cells.isReadOnly == true),
               handler: function(btn) {
                  if (panel.currentRow != undefined) {
                     panel.currentRow = panel.currentRow + 1;
                  } else {
                     panel.currentRow = 0;
                  }

                  var srcValues = btn.ownerCt.ownerCt.srcValues;
                  var valid = true;
                  var params = '';
                  if (srcValues != null) {
                     var frm = panel.getForm();
                     if (panel.isWindow) {
                        frm = Ext.getCmp('main-form').getForm();
                     }
                     if (panel.isViewForm) {
                        frm = Ext.getCmp('owin-form').items.get(0).getForm();
                     }
                     var vals = srcValues.split('|');
                     for (var i = 0; i < vals.length; i++) {
                        var field = vals[i].substring(1);
                        if (field == null) {
                           showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
                           valid = false;
                           break;
                        } else {
                           var ff = frm.findField(field);
                           if (ff == null && Ext.getCmp('win-form')) {
                              ff = Ext.getCmp('win-form').getForm().findField(field);
                           }

                           if (ff == null) {
                              showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
                              valid = false;
                              break;
                           } else if (ff.getValue() == null || (ff.getValue() + '').trim().length == 0) {
                              var lbl = ff.fieldLabel;
                              if (!lbl) {
                                 lbl = ff.name;
                              }
                              showError('กรุณากรอกข้อมูล "' + lbl.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
                              valid = false;
                              break;
                           } else {
                              params += (field + ':' + ff.getValue(0) + '|');
                           }
                        }
                     }
                  }
                  if (valid) {
                     var grid = this.ownerCt.ownerCt;

                     if (params.length > 0) {
                        grid.srcParams = params;
                     }

                     var win = new Senate.FormWindow();
                     win.showForm(panel, grid.cfmID, grid, grid.fmWidth, grid.fmHeight);
                  }
               }
            }],

            fdType: cells.fdType,
            tbID: cells.tbID,
            tbName: cells.tbName,
            removeRows: [],
            removeData: [],
            editRows: [],
            isPK: [],
            isRunning: [],
            isMax: [],
            isReadOnly: cells.isReadOnly,
            detKey: null,
            srcValues: cells.srcValues,

            scriptText: cells.scriptText,

            plugins: [new Ext.ux.grid.GridFilters({
               encode: false,
               local: true
            })],
            view: null,

            groupCol: null,
            enableColumnHide: enableColumnHide,
            enableColumnResize: enableColumnResize,

            listeners: {
               'rowdblclick': function(g) {
                  g.getSelectionModel().clearSelections();
               }
            },

            pushEditRows: function(data) {
               var key = data.fullKey;
               if (!key) {
                  key = data.mainKey + ':' + data.subKey;
                  if (!data.subKey) {
                     key = data.mainKey + ':' + data.rowIndex;
                  }
               }

               this.removeRows.remove(key);

               if (this.editRows.indexOf(key) == -1)
                  this.editRows.push(key);
            },

            pushRemoveRows: function(data) {
               var key = data.fullKey;
               if (!key && data.mainKey) {
                  key = data.mainKey + ':' + data.subKey;
                  if (!data.subKey) {
                     key = data.mainKey + ':' + data.rowIndex;
                  }

                  this.editRows.remove(key);

                  this.removeRows.push(key);

                  // Apichart.s - Fix json is undefined
                  if (data.record.json == undefined) {
                     var row = [];

                     var cm = this.getColumnModel();
                     for (var k = 1; k < cm.getColumnCount(); k++) {
                        row.push(data.record.get(cm.getDataIndex(k)));
                     }
                     this.removeData.push(row);
                  } else
                     this.removeData.push(data.record.json);
               }
            }
         }

         if (cells.isGroup) {
            jsonGrid['view'] = new Ext.grid.GroupingView({
               forceFit: (cells.pixelColumn != 1) ? true : false,
               groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
            });
            jsonGrid['plugins'].push(new Ext.ux.grid.GroupSummary());
            jsonGrid['groupCol'] = true;
         } else if (cells.buffer) {
            jsonGrid['view'] = new Ext.ux.grid.BufferView({
               rowHeight: 20,
               scrollDelay: false
            });
         }

         gridPanel[cells.fdID] = new Ext.grid.GridPanel(jsonGrid);

         //			if (cells.isReadOnly){
         //				gridPanel[cells.fdID].getTopToolbar().hide();
         //			}
         layoutPanel[cells.pfdID + '-0'].items.add(gridPanel[cells.fdID]);
      } else if (cells.fdType == Senate.fd.GridSelect) {
         columns[cells.fdID] = [];
         fields[cells.fdID] = [];

         gridPanel[cells.fdID] = new Ext.grid.GridPanel({
            id: panel.fmID + '-grid-' + cells.fdName,
            fdName: cells.fdName,
            hidden: hidden,
            stripeRows: true,
            store: {},
            colModel: new Ext.grid.ColumnModel([]),

            firstLoad: cells.buffer == 2,

            autoHeight: (cells.pixelColumn != 1) ? true : false,
            viewConfig: {
               forceFit: (cells.pixelColumn != 1) ? true : false
            },
            bodyStyle: 'overflow-x: scroll',
            height: 535,

            bbar: new Ext.PagingToolbar({
               pageSize: 20,
               displayInfo: true,
               displayMsg: 'Displaying results {0} - {1} of {2}',
               emptyMsg: "No results to display"
            }),
            selModel: new Ext.grid.RowSelectionModel({
               singleSelect: true,
               listeners: {
                  'rowselect': function(sm, index, r) {
                     var grid = sm.grid;
                     grid.selRec = new Array();
                     var cm = grid.getColumnModel();
                     for (var i = 0; i < cm.getColumnCount(); i++) {
                        grid.selRec[cm.getDataIndex(i)] = r.get(cm.getDataIndex(i));
                     }
                  }
               }
            }),

            fdType: cells.fdType,
            tbID: cells.tbID,
            tbName: cells.tbName,
            tbOrder: cells.tbOrder,
            cfmID: cells.cfmID,
            excel: cells.exportExcel,
            viewForm: cells.viewForm,
            addForm: cells.addForm,
            enableColumnHide: enableColumnHide,
            enableColumnResize: enableColumnResize
         });
         panel.filterGrid = gridPanel[cells.fdID];
         layoutPanel[cells.pfdID + '-0'].items.add(gridPanel[cells.fdID]);
      } else if (cells.fdType == Senate.fd.GridMulti || cells.fdType == Senate.fd.GridMultiSelect) {
         columns[cells.fdID] = [];
         fields[cells.fdID] = [];

         var firstLoad = false;
         if (cells.buffer == 2) {
            cells.buffer = false;
            firstLoad = true;
         }

         gridPanel[cells.fdID] = new Ext.grid.GridPanel({
            id: panel.fmID + '-grid-' + cells.fdName,
            fdName: cells.fdName,
            hidden: hidden,
            stripeRows: true,
            store: {},
            colModel: new Ext.grid.ColumnModel([]),

            autoHeight: (cells.pixelColumn != 1) ? true : false,
            viewConfig: {
               forceFit: (cells.pixelColumn != 1) ? true : false
            },
            bodyStyle: 'overflow-x: scroll',
            height: 535,

            firstLoad: firstLoad,
            isBuffer: cells.buffer,
            bbar: ((!cells.buffer) ? new Ext.PagingToolbar({
               pageSize: 20,
               displayInfo: true,
               displayMsg: 'Displaying results {0} - {1} of {2}',
               emptyMsg: "No results to display",
               listeners: {
                  'change': function(pg, data) {
                     var grid = pg.ownerCt;
                     var store = grid.getStore();
                     var indexs = [];
                     for (var i = 0; i < store.getCount(); i++) {
                        var r = store.getAt(i);
                        var keys = r.get(grid.isPK[0]) + ':' + r.get(grid.isPK[1]);
                        if (grid.selRec[keys] != undefined) {
                           indexs.push(i);
                        }
                     }
                     grid.getSelectionModel().selectRows(indexs);
                  }
               }
            }) : null),
            selModel: new Ext.grid.CheckboxSelectionModel({
               checkOnly: true,
               listeners: {
                  'rowselect': function(sm, index, r) {
                     var grid = sm.grid;
                     var keys = r.get(grid.isPK[0]) + ':' + r.get(grid.isPK[1]);

                     var rec = grid.selRec[keys];

                     if (rec) {
                        var cm = grid.getColumnModel();
                        for (var i = 0; i < cm.getColumnCount(); i++) {
                           var c = cm.getDataIndex(i);
                           if (c && c.length > 0 && rec[c]) {
                              rec[c] = r[c];
                           }
                        }
                     } else {
                        grid.selRec[keys] = r;
                     }
                     if (r.get('DYN_FMID')) {
                        grid.dynFmID = r.get('DYN_FMID');
                     } else {
                        grid.dynFmID = undefined;
                     }

                     if (r.get('VoidStatus') || r.get('VOIDSTATUS') ||
                        r.get('DFDocNo') || r.get('DFDOCNO') ||
                        r.get('Approved') || r.get('APPROVED')) {
                        var tbar = panel.mainBody.getTopToolbar();
                        for (var i = 0; i < tbar.items.length; i++) {
                           if (tbar.get(i).mcFuncID == Senate.cm.EditForm) {
                              tbar.get(i).setVisible(false);
                              sm.hideButton = tbar.get(i);
                           }
                        }
                     } else if (sm.hideButton != null) {
                        sm.hideButton.setVisible(true);
                     }

                     if (r.get('VoidStatus') || r.get('VOIDSTATUS')) {
                        grid.voidStatus = true;
                     }

                     var tbar = panel.mainBody.getTopToolbar();
                     if (r.get('VoidStatus') || r.get('VOIDSTATUS')) {
                        if(tbar.items.length > 0)
							tbar.items.get(tbar.items.length - 1).show();
                     } else {
						 if(tbar.items.length > 0)
							tbar.items.get(tbar.items.length - 1).hide();
                     }
                  },
                  'rowdeselect': function(sm, index, r) {
                     var grid = sm.grid;
                     var keys = r.get(grid.isPK[0]) + ':' + r.get(grid.isPK[1]);
                     delete grid.selRec[keys];
                  }
               }
            }),

            //				view: new Ext.grid.GridView({
            //			        getRowClass: function (rec, idx, rowParams, store) {
            //			        	return "disabled-record";
            //			        }
            //			            
            //			    }),

            fdType: cells.fdType,
            tbID: cells.tbID,
            tbName: cells.tbName,
            tbOrder: cells.tbOrder,
            cfmID: cells.cfmID,
            selRec: new Array(),
            isPK: [],
            excel: cells.exportExcel,
            viewForm: cells.viewForm,
            addForm: cells.addForm,
            enableColumnHide: enableColumnHide,
            enableColumnResize: enableColumnResize,
            tbar: new Ext.Toolbar({
                           hidden: true
                        })
         });
         panel.filterGrid = gridPanel[cells.fdID];
         layoutPanel[cells.pfdID + '-0'].items.add(gridPanel[cells.fdID]);
      } else if (cells.fdType == Senate.fd.Column) {
         if (gridPanel[cells.pfdID].getXType() != 'editorgrid' && columns[cells.pfdID].length == 0) {
            if (gridPanel[cells.pfdID].selModel != undefined) {
               if (gridPanel[cells.pfdID].fdType != Senate.fd.GridSelect &&
                  gridPanel[cells.pfdID].fdType != Senate.fd.GridPanel) {
                  columns[cells.pfdID].push(gridPanel[cells.pfdID].selModel);
               }
            }
         }

         if (gridPanel[cells.pfdID].pk == undefined && cells.isPK) {
            gridPanel[cells.pfdID].pk = cells.tfName;
            gridPanel[cells.pfdID].relString = cells.relString;
         }
         if (gridPanel[cells.pfdID].isPK != undefined && cells.isPK) {
            gridPanel[cells.pfdID].isPK.push(cells.tfName);
         }
         if (gridPanel[cells.pfdID].isRunning != undefined && cells.isRunning) {
            gridPanel[cells.pfdID].isRunning.push(cells.tfName);
         }
         if (gridPanel[cells.pfdID].isMax != undefined && cells.isMax) {
            gridPanel[cells.pfdID].isMax.push(cells.tfName);
         }
         if (gridPanel[cells.pfdID].detKey == null && cells.isPK && cells.isRunning != 1 && cells.isMax != 1) {
            gridPanel[cells.pfdID].detKey = cells.tfName;
         }

         if (!gridPanel[cells.pfdID].isDynFm && cells.tfName == 'DYN_FMID') {
            gridPanel[cells.pfdID].isDynFm = true;
         }

         var colProp = {
            id: 'col-' + cells.fdName,
            targetFD: cells.targetFD,
            calc: cells.calcExpr,
            header: cells.lbName,
            dataIndex: cells.tfName,
            width: cells.width,
            hidden: !cells.visible,
            sortable: true,
            isPK: cells.isPK,
            gfmID: cells.gfmID,
            tfType: cells.tfType,
	    isRequire: cells.isRequire
         };

         if (gridPanel[cells.pfdID].getXType() == 'editorgrid' && (!gridPanel[cells.pfdID].isReadOnly || cells.isReadOnly == 0) && !cells.isPK) {
            if (!gridPanel[cells.pfdID].allowSave && cells.isReadOnly == 0 && gridPanel[cells.pfdID].getTopToolbar().hidden) {
               gridPanel[cells.pfdID].getTopToolbar().show();
               gridPanel[cells.pfdID].allowSave = true;
            }

            if (cells.ctbID != null) {
               var combo = new Ext.form.ComboBox({
                  ctfName: cells.ctfName,
                  typeAhead: true,
                  triggerAction: 'all',
                  readOnly: cells.isReadOnly,
                  mode: 'local',
                  valueField: 'id',
                  displayField: 'name',
                  listeners: {
                     'blur': function(cmb) {
                        if (typeof cmb.getValue() == 'string' && !cmb.getValue().match(/\<.*\>/ig) && cmb.getValue()) {
                           var label = cmb.fieldLabel.replace(/(<([^>]+)>)/ig, '');
                           show_info('"' + label + '" not found', 'Alert', function() {
                              cmb.reset();
                           });
                        }
                     }
                  }
               });
               combo.store = new Ext.data.Store({
                  comboId: combo.id,
                  //baseParams: { tbID: parseInt(cells.ctbID) },
                  baseParams: {
                     tbID: parseInt(cells.ctbID),
                     srcParams: panel.srcParams
                  },
                  autoLoad: true,
                  proxy: new Ext.data.HttpProxy({
                     method: 'GET',
                     url: Senate.url.Combo
                  }),
                  reader: new Ext.data.ArrayReader({
                     root: 'data'
                  }, [{
                        name: 'id'
                     },
                     {
                        name: 'name'
                     }
                  ])
               });
               colProp.editor = combo;
               colProp.renderer = Ext.util.Format.comboRenderer(combo);
            } else if (cells.tfType == Senate.tf.DateTime) {
               colProp.editor = new Ext.form.DateField({
                  cls: (cells.isReadOnly != 1) ? 'white-field' : '',
                  editable: false,
                  dateFormat: 'd/m/Y',
                  readOnly: cells.isReadOnly
               });
            } else if (cells.tfType == Senate.tf.Integer) {
               colProp.editor = new Ext.form.NumberField({
                  editable: false,
                  allowDecimals: false,
                  readOnly: cells.isReadOnly,
                  scriptText: cells.scriptText,
                  listeners: {
                     'blur': function(fd) {
                        if (fd.scriptText) {
                           debug(fd.scriptText, {
                              fd: fd
                           });
                        }
                     }
                  }
               });
            } else if (cells.tfType == Senate.tf.Currency) {
               colProp.editor = new Ext.form.NumberField({
                  editable: false,
                  readOnly: cells.isReadOnly,
                  scriptText: cells.scriptText,
                  listeners: {
                     'blur': function(fd) {
                        if (fd.scriptText) {
                           debug(fd.scriptText, {
                              fd: fd
                           });
                        }
                     }
                  }
               });
            } else if (cells.tfType == Senate.tf.Currency3) {

               colProp.editor = new Ext.form.NumberField3({
                  editable: false,
                  readOnly: cells.isReadOnly,
                  scriptText: cells.scriptText,
                  listeners: {
                     'blur': function(fd) {
                        if (fd.scriptText) {
                           debug(fd.scriptText, {
                              fd: fd
                           });
                        }
                     }
                  }
               });
            } else {
               colProp.editor = new Ext.form.TextField({
                  editable: false,
                  readOnly: cells.isReadOnly
               });
            }
         }

         var column = new Ext.grid.Column(colProp);
         if (cells.tfType == Senate.tf.Boolean) {
            column['renderer'] = activeColumn;
            column['align'] = 'center';
         } else if (cells.tfType == Senate.tf.Currency) {
            column['renderer'] = currencyColumn;
            column['align'] = 'right';
         } else if (cells.tfType == Senate.tf.Time) {
            column['renderer'] = timeColumn;
         } else if (cells.tfType == Senate.tf.DateTime) {
            column['renderer'] = dateColumn;
         }

         switch (cells.alignment) {
            case 1: {
               column['align'] = 'center';
               break;
            }
            case 2: {
               column['align'] = 'right';
               break;
            }
         }

         if (cells.groupType || cells.groupType == 0) {
            var type = parseInt(cells.groupType);
            switch (type) {
               case Senate.gr.Label: {
                  column['summaryType'] = 'count';
                  column['summaryRenderer'] = function(v, params, data) {
                     return ((v === 0 || v > 1) ? '(' + v + ' Items)' : '(1 Item)');
                  };
                  break;
               }
               case Senate.gr.Sum: {
                  column['summaryType'] = 'sum';
                  break;
               }
               case Senate.gr.Count: {
                  column['summaryType'] = 'count';
                  break;
               }
               case Senate.gr.Max: {
                  column['summaryType'] = 'max';
                  break;
               }
               case Senate.gr.Min: {
                  column['summaryType'] = 'sum';
                  break;
               }
               case Senate.gr.Average: {
                  column['summaryType'] = 'average';
                  break;
               }
            }
         }

         columns[cells.pfdID].push(column);
         fields[cells.pfdID].push({
            name: cells.tfName
         });

         if (gridPanel[cells.pfdID].getXType() == 'editorgrid') {
            if (cells.tfType == Senate.tf.Integer) {
               filters[cells.pfdID].push({
                  type: 'numeric',
                  dataIndex: cells.tfName
               });
            } else if (cells.tfType == Senate.tf.Boolean) {
               filters[cells.pfdID].push({
                  type: 'boolean',
                  dataIndex: cells.tfName
               });
            } else if (cells.tfType == Senate.tf.DateTime) {
               filters[cells.pfdID].push({
                  type: 'date',
                  dateFormat: 'd/m/Y',
                  dataIndex: cells.tfName
               });
            } else {
               filters[cells.pfdID].push({
                  type: 'string',
                  dataIndex: cells.tfName
               });
            }
         }
      } else if (cells.fdType == Senate.fd.BarChart) {
         chart[cells.fdID] = new Ext.chart.ColumnChart({
            id: panel.fmID + '-fdName-' + cells.fdName,
            height: 300,
            fdType: cells.fdType,
            tbID: cells.tbID,
            xField: cells.tfName,

            fields: [cells.tfName, cells.ctfName],

            series: [
               new Ext.chart.Series({
                  type: 'column',
                  yField: cells.ctfName
               })
            ]
         });

         var key = cells.pfdID + '-' + cells.refColumn;
         layoutPanel[key].add(chart[cells.fdID]);
      }
      //		else if (cells.fdType == Senate.fd.LineChart) {			
      //			chart[cells.fdID] = new Ext.chart.LineChart({
      //				id: panel.fmID + '-fdName-' + cells.fdName,
      //		        height: 300,
      //				fdType: cells.fdType,
      //				tbID: cells.tbID,
      //				
      //				fields: [cells.tfName, cells.ctfName],
      //				
      //				xField: cells.tfName,
      //				yField: cells.ctfName
      //			});
      //			 
      //			var key = cells.pfdID + '-' + cells.refColumn;	
      //			layoutPanel[key].add(chart[cells.fdID]);
      //		}
      //		else if (cells.fdType == Senate.fd.FieldSet) {
      //			var key = cells.pfdID + '-' + cells.refColumn;
      //			fieldSet[cells.fdID] = new Ext.form.FieldSet({
      //				title: cells.lbName,
      //				collapsible: true,
      //        		autoHeight: true
      //			});
      //			layoutPanel[key].items.add(fieldSet[cells.fdID]);
      //		}
      else {
         var key = cells.pfdID + '-' + cells.refColumn;
         var id = panel.fmID + '-fdName-' + cells.fdName;
         if (panel.isWindow) {
            id = 'w' + id;
         }

         if (panel.filterForm) {
            if (cells.extSearch) {
               panel.extSearch = {
                  field: id,
                  expr: cells.extSearch
               }
            }
         }
         if (!cells.summaryType)
            panel.dataFields.push(id);

         var cmp = getComp(id, cells, panel);
         cmp.disabled = (cells.enable == 0);
         if (layoutPanel[key] != undefined) {
            cmp.fdType

            layoutPanel[key].add(cmp);
         } else if (gridPanel[cells.pfdID] != undefined) {
            var tb = gridPanel[cells.pfdID].getTopToolbar();
            if (!tb.tbField) {
               tb.tbField = true;
               tb.add('->');

               var cmb = new Ext.form.ComboBox({
                  id: 'cmb-tbar-' + panel.fmID + '-' + gridPanel[cells.pfdID].id,
                  refGrid: gridPanel[cells.pfdID],
                  fieldLabel: 'Select Field',
                  mode: 'local',
                  typeAhead: true,
                  triggerAction: 'all',
                  editable: false,
                  store: new Ext.data.JsonStore({
                     autoLoad: false,
                     fields: [
                        'id',
                        'name'
                     ]
                  }),
                  valueField: 'id',
                  displayField: 'name',
                  listeners: {
                     'select': function(cmb) {
                        if (cmb.getValue()) {
                           var grid = cmb.refGrid;
                           var tbar = grid.getTopToolbar();
                           for (var j = 0; j < tbar.items.length; j++) {
                              var ff = tbar.get(j);
                              if (ff.tfType) {
                                 var val = ff.getValue();
                                 if (val) {
                                    if (ff.getXType() == 'combo') {
                                       ff.refField.setValue(null);
                                    }
                                    ff.setValue(null);
                                 }

                                 ff.hide();
                              }
                           }

                           var comp = Ext.getCmp(cmb.getValue());
                           if (comp) {
                              comp.show();
                           }
                        }
                     }
                  }
               });

               var apply = new Ext.Button({
                  refGrid: gridPanel[cells.pfdID],
                  text: 'Apply',
                  handler: function(btn) {
                     var grid = btn.refGrid;
                     var pk = grid.isPK;
                     var tbar = grid.getTopToolbar();
                     for (var j = 0; j < tbar.items.length; j++) {
                        var ff = tbar.get(j);
                        if (ff.tfType) {
                           var store = grid.getStore();
                           for (var k = 0; k < store.getCount(); k++) {
                              var rec = store.getAt(k);
                              var val = ff.getValue();
                              if (val) {
                                 if (ff.getXType() == 'combo') {
                                    rec.set(ff.refField.ctfName, val);
                                    rec.set(ff.getName(), ff.refField.getValue());
                                 } else if (ff.getValue() && (ff.getXType() == 'datefield' || ff.getXType() == 'monthfield')) {
                                    rec.set(ff.getName(), val.format('d/m/Y'));
                                 } else {
                                    rec.set(ff.getName(), val);
                                 }

                                 grid.pushEditRows({
                                    mainKey: rec.get(pk[0]),
                                    subKey: rec.get(pk[1])
                                 });
                              }
                           }
                        }
                     }
                  }
               });

               //			        var clear = new Ext.Button({
               //			            refGrid: gridPanel[cells.pfdID],
               //			            text: 'Clear',
               //			            handler: function(btn) {
               //			                var grid = btn.refGrid;
               //			                var tbar = grid.getTopToolbar();
               //			                for (var j = 0; j < tbar.items.length; j++) {
               //			                    var ff = tbar.get(j);
               //			                    if (ff.tfType) {
               //		                            var val = ff.getValue();
               //		                            if (val) {
               //		                                if (ff.getXType() == 'combo') {
               //		                                    ff.refField.setValue(null);
               //    					                }
               //    					                ff.setValue(null);
               //		                            }
               //			                    }
               //			                }
               //			            }
               //			        });

               tb.add([cmb]);
               tb.applyButton = ['-', apply];
            }

            var combo = Ext.getCmp('cmb-tbar-' + panel.fmID + '-' + gridPanel[cells.pfdID].id);
            var cmbStore = combo.getStore();
            var Rec = cmbStore.recordType;

            if (cmp.length) {
               cmp[0].width = cells.width;
               cmp[0].hidden = true;
               cmbStore.add(new Rec({
                  id: cmp[0].id,
                  name: cells.lbName
               }));
            } else {
               cmp.width = cells.width;
               cmp.hidden = true;
               cmbStore.add(new Rec({
                  id: cmp.id,
                  name: cells.lbName
               }));
            }

            tb.add(cmp);
         } else {
            fieldSet[cells.pfdID].add(cmp);
         }

         if (cells.summaryType) {
            var gridFilter = panel.filterGrid;
            if (!gridFilter.aggList) {
               gridFilter.aggList = new Array();
            }
            gridFilter.aggList.push({
               fdName: cells.fdName,
               tfName: cells.tfName,
               summaryType: cells.summaryType
            });
         }
      }
   }

   var detTables = '';
   panel.details = new Array();
   for (g in gridPanel) {
      if (typeof gridPanel[g] == 'object') {
         if (gridPanel[g].tbID != null) {
            detTables += gridPanel[g].tbID + '|';
         }
         panel.details.push(gridPanel[g]);

         var fdType = gridPanel[g].fdType;
         if (fdType == Senate.fd.GridMultiSelect) {
            fdType = Senate.fd.GridMulti;
         }

         if (gridPanel[g].allowSave) {
            gridPanel[g].isReadOnly = false;
         }

		switch (fdType) {
			case Senate.fd.GridPanel: {
				gridPanel[g].colModel = new Ext.grid.ColumnModel(columns[g]);

				var jsonDs = {
					autoLoad: !gridPanel[g].groupCol && !gridPanel[g].isBuffer,
					proxy: new Ext.data.HttpProxy({
									method: 'POST',
									url: Senate.url.Grid,
									refGrid: gridPanel[g],
									success: function(result, r) {
										if (r.refGrid && r.refGrid.maskLoading) {
											r.refGrid.maskLoading.hide();
										}

										var json = Ext.util.JSON.decode(result.responseText);
										if (!json.success) {
											showError(json.errMessage, 'GridPanel');
										} else {
											var aggList = panel.filterGrid.aggList;
											if (aggList) {
												var aggData = json.details;
												for (var i = 0; i < aggData.length; i++) {
													set_value(aggList[i].fdName, aggData[i]);
												}
											}
										}
									}
								}),
					reader: new Ext.data.ArrayReader({
						root: 'data',
						totalProperty: 'total',
						messageProperty: 'message'
					}, fields[g])
				};

				var ds = (!gridPanel[g].groupCol) ? new Ext.data.Store(jsonDs) : new Ext.data.GroupingStore(jsonDs);

				var f = '';
				for (var i = 0; i < fields[g].length; i++) {
					f += fields[g][i].name + ',';
				}
				ds.setBaseParam('tbID', gridPanel[g].tbID);

				if (gridPanel[g].fdType == Senate.fd.GridPanel) {
					ds.setBaseParam('tbName', gridPanel[g].tbName);
					ds.setBaseParam('tbOrder', gridPanel[g].tbOrder);

					var dets = '';
					var cm = gridPanel[g].getColumnModel();
					for (var i = 0; i < cm.getColumnCount(); i++) {
						var di = cm.getDataIndex(i);
						if (di != undefined && di.length > 0) {
							dets += di + '|';
						}
					}
					ds.setBaseParam('dets', dets);
					gridPanel[g].dets = dets;
				}

				if (gridPanel[g].aggList) {
					ds.setBaseParam('aggList', Ext.util.JSON.encode(gridPanel[g].aggList));
				}

				gridPanel[g].store = ds;
				if (gridPanel[g].fdType == Senate.fd.GridPanel && !gridPanel[g].groupCol && gridPanel[g].getBottomToolbar()) {
					gridPanel[g].getBottomToolbar().bindStore(ds);
				}

				if (gridPanel[g].groupCol) {
					ds.setBaseParam('limit', 30000);
				} else if (gridPanel[g].isBuffer) {
					ds.setBaseParam('limit', 30000);
				}
				break;
			}
            case Senate.fd.GridDetail: {
               //if (!gridPanel[g].isReadOnly) {
				if (true) {
					if (gridPanel[g].isDynFm) {
						var buttons = [];
						if(gridPanel[g].cfmID != null) {
							buttons.push({
								icon: 'resources/css/images/icons/pencil.png',
								tooltip: 'Edit',
								handler: function(grid, rowIndex, colIndex) {
									panel.currentRow = rowIndex;
									Senate.editRow = rowIndex;
									Senate.editRec = grid.getStore().getAt(rowIndex);

									var srcValues = grid.srcValues;
									var valid = true;
									var params = '';
									if (srcValues != null) {
										var frm = panel.getForm();
										if (panel.isWindow) {
												frm = Ext.getCmp('main-form').getForm();
										}
										if (panel.isViewForm) {
											frm = Ext.getCmp('owin-form').items.get(0).getForm();
										}
										var vals = srcValues.split('|');
										for (var i = 0; i < vals.length; i++) {
											var field = vals[i].substring(1);
											if (field == null) {
												showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
												valid = false;
												break;
											} else {
												var ff = frm.findField(field);
												if (ff == null && Ext.getCmp('win-form')) {
													ff = Ext.getCmp('win-form').getForm().findField(field);
												}

												if (ff == null) {
													showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
													valid = false;
													break;
												} else if (ff.getValue() == null || (ff.getValue() + '').trim().length == 0) {
													showError('กรุณากรอกข้อมูล "' + ff.fieldLabel.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
													valid = false;
													break;
												} else {
													params += (field + ':' + ff.getValue(0) + '|');
												}
											}
										}
									}
								
									if (valid) {
										if (params.length > 0) {
											grid.srcParams = params;
										}

										var win = new Senate.FormWindow();
										win.showForm(panel, grid.cfmID, grid, grid.fmWidth, grid.fmHeight, rowIndex);
									}
								}
							});
						}
						
						if(gridPanel[g].isDynFm) {
							buttons.push({
								icon: 'resources/css/images/icons/blank.png',
								tooltip: 'Template',
								handler: function(grid, rowIndex, colIndex) {
									var srcValues = grid.srcValues;
									var valid = true;
									var params = '';
									if (srcValues != null) {
										var frm = panel.getForm();
										if (panel.isWindow) {
											frm = Ext.getCmp('main-form').getForm();
										}
										
										if (panel.isViewForm) {
											frm = Ext.getCmp('owin-form').items.get(0).getForm();
										}
										var vals = srcValues.split('|');
										for (var i = 0; i < vals.length; i++) {
											var field = vals[i].substring(1);
											if (field == null) {
												showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
												valid = false;
												break;
											} else {
												var ff = frm.findField(field);
												if (ff == null && Ext.getCmp('win-form')) {
												ff = Ext.getCmp('win-form').getForm().findField(field);
												}

												if (ff == null) {
													showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
													valid = false;
													break;
												} else if (ff.getValue() == null || (ff.getValue() + '').trim().length == 0) {
													showError('กรุณากรอกข้อมูล "' + ff.fieldLabel.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
													valid = false;
													break;
												} else {
													params += (field + ':' + ff.getValue(0) + '|');
												}
											}
										}
									}
								   
									if (valid) {
										if (params.length > 0) {
											grid.srcParams = params;
										}

										Senate.paperRow = rowIndex;
										Senate.paperRec = grid.getStore().getAt(rowIndex);
										var win = new Senate.FormWindow();
										var rec = grid.getStore().getAt(rowIndex);
										if (rec.get('DYN_FMID')) {
											win.showForm(panel, rec.get('DYN_FMID'), grid, grid.fmWidth, grid.fmHeight, rowIndex, 1);
											//win.showTemplate(rec.get('DYN_FMID'), rec.get('DYN_KEY'));
										}
									}
								}
							});
						}
                     
						if (!gridPanel[g].isReadOnly) {
							buttons.push({
								icon: 'resources/css/images/icons/delete.png',
								tooltip: 'Remove',
								handler: function(grid, rowIndex, colIndex) {debugger;
									var cm = grid.getColumnModel();

									var indexs = new Array();
									if (cm.findColumnIndex('OSeq') > -1) {
										var r = grid.store.getAt(rowIndex);
										r.rowIndex = rowIndex;
										var store = grid.getStore();
										var records = store.getRange();
										for (var i = 0; i < records.length; i++) {
											var rec = records[i];
											if (rec.get('OSeq') && rec.get('OSeq') == r.get('Seq')) {
											indexs.push(rec);
											}
										}
										indexs.push(r);
									} else {
										var r = grid.store.getAt(rowIndex);
										r.rowIndex = rowIndex;
										indexs.push(r);
									}
								  
									for (var idx = 0; idx < indexs.length; idx++) {
										var r = indexs[idx];
										if (Ext.getCmp('main-form').pID != undefined) {
											var pk = grid.isPK;

											grid.pushRemoveRows({
												mainKey: r.get(pk[0]),
												subKey: r.get(pk[1]),
												rowIndex: r.rowIndex,
												record: r
											});
										}

										for (var j = 0; j < panel.details.length; j++) {
											var detGrid = panel.details[j];
											var detCm = detGrid.getColumnModel();
											if (detCm.findColumnIndex('ISeq') > -1) {
												var detStore = detGrid.getStore();
												var detRecords = detStore.getRange();
												for (var k = 0; k < detRecords.length; k++) {
													var rec = detRecords[k];
													if (rec.get('ISeq') == r.get('Seq') && grid.relateGrid == undefined) {
														detStore.remove(rec);

														var pk = detGrid.isPK;
														detGrid.pushRemoveRows({
															mainKey: rec.get(pk[0]),
															subKey: rec.get(pk[1]),
															rowIndex: k,
															record: rec
														});
													}else{
														if (rec.get('ISeq') == r.get('ISeq') && rec.get('Seq') == r.get('rseq') && grid.relateGrid != undefined) {
															detStore.remove(rec);

															var pk = detGrid.isPK;
															detGrid.pushRemoveRows({
																mainKey: rec.get(pk[0]),
																subKey: rec.get(pk[1]),
																rowIndex: k,
																record: rec
															});
														}
													}
												}
											}
										}

										grid.store.remove(r);
										grid.store.commitChanges(); //Apichart.S support Cloud
									}
								}
							});
						}
						
						if(buttons.length > 0) {
							columns[g].splice(0, 0, new Ext.grid.ActionColumn({
								align: 'center',
								width: (gridPanel[g].autoHeight == true) ? 12 : 105,
								items: buttons
							}));
						}
					} else {
						var buttons = [];
						if(gridPanel[g].cfmID != null) {
							buttons.push({
								icon: 'resources/css/images/icons/pencil.png',
								tooltip: 'Edit',
								handler: function(grid, rowIndex, colIndex) {
									var srcValues = grid.srcValues;
									var valid = true;
									var params = '';
									if (srcValues != null) {
										var frm = panel.getForm();
										if (panel.isWindow) {
											frm = Ext.getCmp('main-form').getForm();
										}
										if (panel.isViewForm) {
											frm = Ext.getCmp('owin-form').items.get(0).getForm();
										}
										var vals = srcValues.split('|');
										for (var i = 0; i < vals.length; i++) {
											var field = vals[i].substring(1);
											if (field == null) {
												showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
												valid = false;
												break;
											} else {
												var ff = frm.findField(field);
												if (ff == null && Ext.getCmp('win-form')) {
													ff = Ext.getCmp('win-form').getForm().findField(field);
												}

												if (ff == null) {
													showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
													valid = false;
													break;
												} else if (ff.getValue() == null || (ff.getValue() + '').trim().length == 0) {
													showError('กรุณากรอกข้อมูล "' + ff.fieldLabel.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
													valid = false;
													break;
												} else {
													params += (field + ':' + ff.getValue(0) + '|');
												}
											}
										}
									}
								   
									if (valid) {
										if (params.length > 0) {
											grid.srcParams = params;
										}

										Senate.editRow = rowIndex;
										Senate.editRec = grid.getStore().getAt(rowIndex);
										var win = new Senate.FormWindow();
										win.showForm(panel, grid.cfmID, grid, grid.fmWidth, grid.fmHeight, rowIndex);
									}
								}
							});
						}
					
						if (!gridPanel[g].isReadOnly) {
							buttons.push({
								icon: 'resources/css/images/icons/delete.png',
								tooltip: 'Remove',
								handler: function(grid, rowIndex, colIndex) {debugger;
									var r = grid.store.getAt(rowIndex);
									if (Ext.getCmp('main-form').pID != undefined) {
										var pk = grid.isPK;
										grid.pushRemoveRows({
											mainKey: r.get(pk[0]),
											subKey: r.get(pk[1]),
											rowIndex: rowIndex,
											record: r
										});
									}
								  
									for (var j = 0; j < panel.details.length; j++) {
										var detGrid = panel.details[j];
										var detCm = detGrid.getColumnModel();
										if (detCm.findColumnIndex('ISeq') > -1) {
											var detStore = detGrid.getStore();
											var detRecords = detStore.getRange();
											for (var k = 0; k < detRecords.length; k++) {
												var rec = detRecords[k];
												if (rec.get('ISeq') == r.get('Seq') && grid.relateGrid == undefined) {
													// Re-Mark
													detStore.remove(rec);

													var pk = detGrid.isPK;
													detGrid.pushRemoveRows({
														mainKey: rec.get(pk[0]),
														subKey: rec.get(pk[1]),
														rowIndex: k,
														record: rec
													});
												}else{
													if (rec.get('ISeq') == r.get('ISeq') && rec.get('Seq') == r.get('rseq') && grid.relateGrid != undefined) {
														// Re-Mark
														detStore.remove(rec);

														var pk = detGrid.isPK;
														detGrid.pushRemoveRows({
															mainKey: rec.get(pk[0]),
															subKey: rec.get(pk[1]),
															rowIndex: k,
															record: rec
														});
													}
												}
											}
										}
									}
									
									grid.store.remove(r);
									grid.store.commitChanges(); //Apichart.S support Cloud
								}
							});
						}
					
						if(buttons.length > 0){
							columns[g].splice(0, 0, new Ext.grid.ActionColumn({
								align: 'center',
								width: (gridPanel[g].autoHeight == true) ? 12 : 70,
								items: buttons
							}));
						}
					}
                }
			   
				gridPanel[g].colModel = new Ext.grid.ColumnModel(columns[g]);

				if (gridPanel[g].gfmID != null) {
					var jsonBtn = {
						id: 'multi-' + gridPanel[g].id,
						text: 'Multi Select',
						refGrid: gridPanel[g],
						btnIndex: 0,
						fmWidth: 0,
						fmHeight: 0,
						//hidden: (cells.isReadOnly == true),
						handler: function(btn) {
							var srcValues = btn.ownerCt.ownerCt.srcValues;
							var valid = true;
							var params = '';
							if (srcValues != null) {
								var frm = panel.getForm();
								if (panel.isWindow) {
									frm = Ext.getCmp('main-form').getForm();
								}
							
								if (panel.isViewForm) {
									frm = Ext.getCmp('owin-form').items.get(0).getForm();
								}
								var vals = srcValues.split('|');
								for (var i = 0; i < vals.length; i++) {
									var field = vals[i].substring(1);
									if (field == null) {
										showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
										valid = false;
										break;
									} else {
										var ff = frm.findField(field);
										if (ff == null && Ext.getCmp('win-form')) {
											ff = Ext.getCmp('win-form').getForm().findField(field);
										}

										if (ff == null) {
											showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
											valid = false;
											break;
										} else if (ff.getValue() == null || (ff.getValue() + '').trim().length == 0) {
											showError('กรุณากรอกข้อมูล "' + ff.fieldLabel.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
											valid = false;
											break;
										} else {
											params += (field + ':' + ff.getValue(0) + '|');
										}
									}
								}
							}
                        
							if (valid) {
								if (params.length > 0) {
									btn.refGrid.srcParams = params;
								}

								var scriptText = panel.evList[Senate.ev.MultiSelectUpdate];

								var win = new Senate.FormWindow();
								win.showMulti(panel, btn.gfmID, btn.refGrid, btn.btnIndex, scriptText, btn.fmWidth != undefined ? btn.fmWidth : btn.refGrid.fmWidth, btn.fmHeight != undefined ? btn.fmHeight : btn.refGrid.fmHeight);
							}
						}
					};
						
					if (gridPanel[g].gfmArr.length > 0) {
						var arr = gridPanel[g].gfmArr;
						for (var j = 0; j < arr.length; j++) {
							jsonBtn.id = 'multi-' + gridPanel[g].id + '-' + j;
							jsonBtn.gfmID = arr[j].gfmID;
							jsonBtn.text = arr[j].gfmLbl;
							jsonBtn.btnIndex = j;
							jsonBtn.fmWidth = Number(arr[j].gfmWD);
							jsonBtn.fmHeight = Number(arr[j].gfmHH);

							var tbar = gridPanel[g].getTopToolbar();
							if (!tbar.tbField)
                        tbar.add(new Ext.Button(jsonBtn));
							else {
                        tbar.insert(0, new Ext.Button(jsonBtn));
                        tbar.add(tbar.applyButton);
							}
						}
					} else {
						jsonBtn.gfmID = gridPanel[g].gfmID;

						var tbar = gridPanel[g].getTopToolbar();
						if (!tbar.tbField)
							tbar.add(new Ext.Button(jsonBtn));
						else {
							tbar.insert(0, new Ext.Button(jsonBtn));
							tbar.add(tbar.applyButton);
						}
					}
				} else {
					var tbar = gridPanel[g].getTopToolbar();
					if (tbar.tbField) tbar.add(tbar.applyButton);
				}

				if (!gridPanel[g].groupCol) {
					ds = new Ext.data.ArrayStore({
						fields: fields[g],
						refGrid: gridPanel[g],
						autoLoad: false,
						listeners: {
							'load': function(data, rec) {
								calculate(panel, data.refGrid);
							},
							'add': function(data) {
								calculate(panel, data.refGrid);
							},
							'update': function(data) {
								calculate(panel, data.refGrid);
							},
							'remove': function(data) {
								calculate(panel, data.refGrid);
							},
							'datachanged': function(data) {
								calculate(panel, data.refGrid);
							}
						}
					});
				} else {
					ds = new Ext.data.GroupingStore({
						refGrid: gridPanel[g],
						reader: new Ext.data.ArrayReader({}, fields[g]),
						autoLoad: false,
						listeners: {
							'load': function(data, rec) {
								calculate(panel, data.refGrid);
							},
							'add': function(data) {
								calculate(panel, data.refGrid);
							},
							'update': function(data) {
								calculate(panel, data.refGrid);
							},
							'remove': function(data) {
								calculate(panel, data.refGrid);
							},
							'datachanged': function(data) {
								calculate(panel, data.refGrid);
							}
						}
					});
				}

               //if (true) {
				if (gridPanel[g].isReadOnly) {
					//gridPanel[g].getTopToolbar().hide();gridPanel[g].getTopToolbar().items.get(2).id
					var gid = gridPanel[g].id;
					var tb = gridPanel[g].getTopToolbar();
					for (var i = 0; i < tb.items.length; i++) {
						var btn = tb.items.get(i);
						if (btn.id == 'multi-' + gid || btn.id == 'addrec-' + gid) {
							btn.hide();
						}
					}
				}

				gridPanel[g].store = ds;
				break;
			}
            case Senate.fd.GridEditor: {
				gridPanel[g].plugins[0].addFilters(filters[g]);

				if (!gridPanel[g].isReadOnly) {
					columns[g].splice(0, 0, new Ext.grid.ActionColumn({
						align: 'center',
						width: (gridPanel[g].autoHeight == true) ? 8 : 50,
						hidden: (gridPanel[g].allowSave == true),
						items: [{
							icon: 'resources/css/images/icons/delete.png',
							tooltip: 'Remove',
							handler: function(grid, rowIndex, colIndex) {
								if (grid.groupCol) {
									var gBtn = grid.getTopToolbar().get(1);
									grid.getStore().clearGrouping();
									gBtn.showGroup = true;
									gBtn.setText('Show Group');
								}

								var r = grid.store.getAt(rowIndex);
								if (Ext.getCmp('main-form').pID != undefined) {
									var pk = grid.isPK;
									grid.pushRemoveRows({
										mainKey: r.get(pk[0]),
										subKey: r.get(pk[1]),
										rowIndex: rowIndex,
										record: r
									});
								}
								grid.store.remove(r);
							}
						}]
					}));
				}
			   
				gridPanel[g].colModel = new Ext.grid.ColumnModel(columns[g]);

				if (gridPanel[g].gfmID != null) {
					var jsonBtn = {
						id: 'multi-' + gridPanel[g].id,
						text: 'Multi Select',
						refGrid: gridPanel[g],
						btnIndex: 0,
						fmWidth: 0,
						fmHeight: 0,
						//hidden: (cells.isReadOnly == true),
						handler: function(btn) {
							var srcValues = btn.ownerCt.ownerCt.srcValues;
							var valid = true;
							var params = '';
							if (srcValues != null) {
								var frm = panel.getForm();
								if (panel.isWindow) {
									frm = Ext.getCmp('main-form').getForm();
								}
								
								if (panel.isViewForm) {
									frm = Ext.getCmp('owin-form').items.get(0).getForm();
								}
								
								var vals = srcValues.split('|');
								for (var i = 0; i < vals.length; i++) {
									var field = vals[i].substring(1);
									if (field == null) {
										showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
										valid = false;
										break;
									} else {
										var ff = frm.findField(field);
										if (ff == null && Ext.getCmp('win-form')) {
											ff = Ext.getCmp('win-form').getForm().findField(field);
										}
										if (ff == null) {
											showError('ไม่พบข้อมูล "' + field + '"', 'ข้อความ');
											valid = false;
											break;
										} else if (ff.getValue() == null || (ff.getValue() + '').trim().length == 0) {
											showError('กรุณากรอกข้อมูล "' + ff.fieldLabel.replace(/(<([^>]+)>)/ig, '') + '"', 'ข้อความ');
											valid = false;
											break;
										} else {
											params += (field + ':' + ff.getValue(0) + '|');
										}
									}
								}
							}
                        
							if (valid) {
								if (params.length > 0) {
									btn.refGrid.srcParams = params;
								}
								
								var scriptText = panel.evList[Senate.ev.MultiSelectUpdate];
								var win = new Senate.FormWindow();
								win.showMulti(panel, btn.gfmID, btn.refGrid, btn.btnIndex, scriptText, btn.fmWidth != undefined ? btn.fmWidth : btn.refGrid.fmWidth, btn.fmHeight != undefined ? btn.fmHeight : btn.refGrid.fmHeight);
							}
						}
					};
						
					
						
					if (gridPanel[g].gfmArr.length > 0) {
						var arr = gridPanel[g].gfmArr;
						for (var j = 0; j < arr.length; j++) {

								
							jsonBtn.id = 'multi-' + gridPanel[g].id + '-' + j;
							jsonBtn.gfmID = arr[j].gfmID;
							jsonBtn.text = arr[j].gfmLbl;
							jsonBtn.btnIndex = j;
							jsonBtn.fmWidth = Number(arr[j].gfmWD);
							jsonBtn.fmHeight = Number(arr[j].gfmHH);
								
							var tbar = gridPanel[g].getTopToolbar();
							if (!tbar.tbField)
								tbar.add(new Ext.Button(jsonBtn));	
							else {
								tbar.insert(0, new Ext.Button(jsonBtn));
								    tbar.add(tbar.applyButton);
							}
						}
					} else {
						jsonBtn.gfmID = gridPanel[g].gfmID;

						var tbar = gridPanel[g].getTopToolbar();
						if (!tbar.tbField)
							tbar.add(new Ext.Button(jsonBtn));
						else {
							tbar.insert(0, new Ext.Button(jsonBtn));
							tbar.add(tbar.applyButton);
						}
					}
				} else {
					var tbar = gridPanel[g].getTopToolbar();
					if (tbar.tbField) tbar.add(tbar.applyButton);
				}

				var ds = null;

				if (!gridPanel[g].groupCol) {
					ds = new Ext.data.ArrayStore({
						fields: fields[g],
						refGrid: gridPanel[g],
						autoLoad: false,
						listeners: {
							'load': function(data, rec) {
								calculate(panel, data.refGrid);
							},
							'add': function(data) {
								calculate(panel, data.refGrid);
							},
							'update': function(data) {
								calculate(panel, data.refGrid);
							},
							'remove': function(data) {
								calculate(panel, data.refGrid);
							},
							'datachanged': function(data) {
								calculate(panel, data.refGrid);
							}
						}
					});
				} else {
					ds = new Ext.data.GroupingStore({
						refGrid: gridPanel[g],
						reader: new Ext.data.ArrayReader({}, fields[g]),
						autoLoad: false,
						listeners: {
							'load': function(data, rec) {
								calculate(panel, data.refGrid);
							},
							'add': function(data) {
								calculate(panel, data.refGrid);
							},
							'update': function(data) {
								calculate(panel, data.refGrid);
							},
							'remove': function(data) {
								calculate(panel, data.refGrid);
							},	
							'datachanged': function(data) {
								calculate(panel, data.refGrid);
							}
						}
					});
				}

				gridPanel[g].store = ds;
				break;
			}
            case Senate.fd.GridSelect: {
				gridPanel[g].colModel = new Ext.grid.ColumnModel(columns[g]);

				var ds = new Ext.data.Store({
					//autoLoad: true,
					autoLoad: !gridPanel[g].firstLoad,
					proxy: new Ext.data.HttpProxy({
						method: 'POST',
						url: Senate.url.Grid,
						success: function(result) {
							var json = Ext.util.JSON.decode(result.responseText);
							if (!json.success) {
								showError(json.errMessage, 'GridSelect');
							}
						}
					}),
					reader: new Ext.data.ArrayReader({
						root: 'data',
						totalProperty: 'total'
					}, fields[g])
				});
				var f = '';
				for (var i = 0; i < fields[g].length; i++) {
					f += fields[g][i].name + ',';
				}
				ds.setBaseParam('tbID', gridPanel[g].tbID);
				ds.setBaseParam('tbName', gridPanel[g].tbName);
				ds.setBaseParam('tbOrder', gridPanel[g].tbOrder);
				ds.setBaseParam('srcParams', panel.srcParams);

				var dets = '';
				var cm = gridPanel[g].getColumnModel();
				for (var i = 0; i < cm.getColumnCount(); i++) {
					var di = cm.getDataIndex(i);
					if (di != undefined && di.length > 0) {
						dets += di + '|';
					}
				}
				ds.setBaseParam('dets', dets);
				gridPanel[g].dets = dets;

				gridPanel[g].store = ds;

				if (gridPanel[g].isBuffer) {
					ds.setBaseParam('limit', 30000);
				} else {
					gridPanel[g].getBottomToolbar().bindStore(ds);
				}
				break;
			}
            case Senate.fd.GridMulti: {
				gridPanel[g].colModel = new Ext.grid.ColumnModel(columns[g]);

				var ds = new Ext.data.Store({
					refGrid: gridPanel[g],
					//autoLoad: true,
					autoLoad: !gridPanel[g].firstLoad,
					proxy: new Ext.data.HttpProxy({
						method: 'POST',
						url: Senate.url.Grid,
						success: function(result) {
							var json = Ext.util.JSON.decode(result.responseText);
							if (!json.success) {
								showError(json.errMessage, 'GridMulti');
							}
						}
					}),
					reader: new Ext.data.ArrayReader({
						root: 'data',
						totalProperty: 'total'
					}, fields[g])
				});
				var f = '';
				for (var i = 0; i < fields[g].length; i++) {
					f += fields[g][i].name + ',';
				}
				ds.setBaseParam('tbID', gridPanel[g].tbID);
				ds.setBaseParam('tbName', gridPanel[g].tbName);
				ds.setBaseParam('tbOrder', gridPanel[g].tbOrder);
				ds.setBaseParam('srcParams', panel.srcParams);

				var dets = '';
				var cm = gridPanel[g].getColumnModel();
				for (var i = 0; i < cm.getColumnCount(); i++) {
					var di = cm.getDataIndex(i);
					if (di != undefined && di.length > 0) {
						dets += di + '|';
					}
				}
				ds.setBaseParam('dets', dets);
				gridPanel[g].dets = dets;

				gridPanel[g].store = ds;

				if (gridPanel[g].isBuffer) {
					ds.setBaseParam('limit', 30000);
				} else {
					gridPanel[g].getBottomToolbar().bindStore(ds);
				}

				ds.on('load', function(store) {
					var grid = store.refGrid;
					var selections = grid.getSelectionModel().getSelections();
					//console.log(selections);
				});

				break;
			}
        }

        if (gridPanel[g].viewForm) {
            var tbar = gridPanel[g].getTopToolbar();
            var expr = gridPanel[g].viewForm.split('|');

            var viewIndex = -1;
            for (var i = 0; i < expr.length; i++) {
               var keys = expr[i].split(':');
               var type = keys[0];
               var label = 'View Form';
               if (type == 2) {
                  label = 'Edit Form';
               } else if (type == 1) {
                  viewIndex++;
               }
               if (keys.length > 1) {
                  label = keys[1];
               }

               tbar.insert(i, new Ext.Button({
                  text: label,
                  type: type,
                  viewIndex: viewIndex,
                  refGrid: gridPanel[g],
                  handler: function(btn) {
                     var subDocID = 'SubDocID';
                     var subFMID = 'SubFMID';
                     var gg = btn.refGrid;
                     var cm = gg.getColumnModel();
                     if (cm.findColumnIndex(subDocID) == -1) {
                        show_info('Column "' + subDocID + '" not found');
                        return;
                     }
                     if (cm.findColumnIndex(subFMID) == -1) {
                        show_info('Column "' + subFMID + '" not found');
                        return;
                     }

                     var rec = null;
                     if (gg.fdType == Senate.fd.GridDetail) {
                        rec = gg.getSelectionModel().getSelected();
                     } else {
                        rec = gg.selectedRow;
                     }

                     if (!rec) {
                        show_info('Please select item');
                     } else {
                        var docID = (rec.data[subDocID].toString().split('|'))[btn.viewIndex];
                        var fmID = (rec.data[subFMID].toString().split('|'))[btn.viewIndex];

                        if (docID < 1) {
                           show_info('Data not found');
                           return;
                        }
                        if (fmID < 1) {
                           show_info('Form ID not found');
                           return;
                        }

                        var pid = '&pid=' + docID;
                        var mode = '&mode=' + ((btn.type == 2) ? 'editFrm' : 'viewFrm');
                        var title = (btn.type == 2) ? 'Edit Form' : 'View Form';
                        var h = screen.height - 300;
                        var w = screen.width - 300;
                        var left = (screen.width / 2) - (w / 2);
                        var top = (screen.height / 2) - (h / 2);

                        window.open("Default.aspx?fmID=" + fmID + "&title=" + title + mode + pid, "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=" + w + ", height=" + h + ",top=" + top + ",left=" + left);

                        //window.open("Default.aspx?fmID=" + fmID + "&title=" + title + mode + pid, title, "titlebar=no,statusbar=no,menubar=no,resizable=no,scrollbars=yes,width=" + w + ",height=" + h + ",top=" + top + ",left=" + left);

                        //open_winForm(fmID, docID, btn.type == 1);
                     }
                  }
               }));
            }
            tbar.insert(expr.length, '-');
         }

         if (gridPanel[g].addForm) {
            var tbar = gridPanel[g].getTopToolbar();
            var expr = gridPanel[g].addForm.split('|');
            var btnItems = new Array();
            for (var i = 0; i < expr.length; i++) {
               var keys = expr[i].split(':');
               var fmID = keys[0];
               var label = 'Form ' + (i + 1);
               if (keys.length > 1) {
                  label = keys[1];
               }
               btnItems.push({
                  fmID: fmID,
                  text: label,
                  tbID: gridPanel[g].tbID,
                  fdName: gridPanel[g].fdName,
                  handler: function(btn) {
                     open_winForm(btn.fmID, null, null, function() {
                        load_data({
                           tbID: btn.tbID
                        }, function(data) {
                           set_store(btn.fdName, data);
                        });
                     });
                  }
               });
            }
            var btn = new Ext.Button({
               text: 'New',
               menu: new Ext.menu.Menu({
                  items: btnItems
               })
            });
            tbar.insert(0, btn);
            tbar.insert(1, '-');
         }

         if (gridPanel[g].excel) {
            var tbar = gridPanel[g].getTopToolbar();
            if (!tbar) {
               tbar = new Ext.Toolbar();
            }
            tbar.show();

            var expr = gridPanel[g].excel.split('|');
            for (var i = 0; i < expr.length; i++) {
               var keys = expr[i].split(':');
               var type = keys[0];
               var label = 'Export All';
               if (type == 2) {
                  label = 'Export Result';
               }
               if (keys.length > 1) {
                  label = keys[1];
               }

               tbar.insert(i, new Ext.Button({
                  text: label,
                  etype: type,
                  refGrid: gridPanel[g],
                  handler: function(btn) {
                     show_loading();

                     var grid = btn.refGrid;
                     var cm = grid.getColumnModel();
                     var store = grid.getStore();

                     var tbID = undefined;
                     var xlsData = {};

                     xlsData.types = [];
                     xlsData.columns = [];
                     xlsData.dataIndex = [];
                     /*var j = 0;
                     if(grid.fdType == Senate.fd.GridMultiSelect){
                        j = 1;
                     }
		     
		     for (j; j < cm.getColumnCount(); j++) {*/
		     
                     for (var j = 0; j < cm.getColumnCount(); j++) {
                        if (!cm.isHidden(j) && cm.getColumnHeader(j)) {
                           xlsData.dataIndex.push(cm.getDataIndex(j));
                           xlsData.columns.push(cm.getColumnHeader(j));
                           xlsData.types.push(cm.config[j].tfType);
                        }
                     }

                     var sql = null;
                     if (grid.fdType == Senate.fd.GridPanel) {
		     /*
                        var store = grid.getStore();
                        if (store.baseParams.sql) {
                           tbID = -1;
                           sql = store.baseParams.sql;
                        } else {
                           tbID = grid.tbID;
                        }
                     } else if(grid.fdType == Senate.fd.GridMultiSelect){
                        */
			var store = grid.getStore();
                        if (store.baseParams.sql) {
                           tbID = -1;
                           sql = store.baseParams.sql;
                        } else {
                           tbID = grid.tbID;
                        }
                     } else {
                        xlsData.data = [];
                        for (var j = 0; j < store.getCount(); j++) {
                           var rec = store.getAt(j);
                           var row = [];
                           for (var k = 0; k < xlsData.dataIndex.length; k++) {
                              var value = rec.get(xlsData.dataIndex[k]);
                              //	                                    if (xlsData.types[k] == Senate.tf.DateTime && value) {
                              //	                                        value = Ext.util.Format.date(value, 'd/m/Y')
                              //	                                    }
                              row.push(value);
                           }
                           xlsData.data.push(row);
                        }
                     }

                     var pageTab = Ext.getCmp('page-tab');
                     var fileTitle = '';
                     if (pageTab) {
                        fileTitle = pageTab.getActiveTab().title;
                     } else {
                        fileTitle = getParameter('title');
                     }

                     Ext.Ajax.request({
                        url: Senate.url.Excel,
                        method: 'POST',
                        params: {
                           fmID: panel.fmID,
                           tbID: tbID,
                           fileTitle: fileTitle,
                           jsonData: Ext.util.JSON.encode(xlsData),
                           type: btn.etype,
                           tbName: grid.tbName,
                           tbOrder: grid.tbOrder,
                           filterStr: grid.filterStr,
                           dets: grid.dets,
                           extSearch: grid.extSearch,
                           sql: sql
                        },
                        success: function(result) {
                           hide_loading();

                           var json = Ext.util.JSON.decode(result.responseText);

                           if (json.success) {
                              window.location = Senate.url.Download + '?name=' + json.fileName + '&path=' + json.filePath;
                           } else {
                              show_error('Export data failed: ' + json.error);
                           }
                        },
                        failure: function() {
                           hide_loading();
                           show_error('Export data error');
                        }
                     });
                  }
               }));
            }
            tbar.insert(expr.length, '-');
         }
      }
   }

   for (c in chart) {
      if (typeof chart[c] == 'object') {
         switch (chart[c].fdType) {
            case Senate.fd.BarChart: {
               var ds = new Ext.data.JsonStore({
                  fields: chart[c].fields
               });

               Ext.Ajax.request({
                  url: Senate.url.Store,
                  method: 'POST',
                  params: {
                     tbID: chart[c].tbID,
                     names: Ext.util.JSON.encode(chart[c].fields)
                  },
                  success: function(result) {
                     var json = Ext.util.JSON.decode(result.responseText);

                     if (json.success) {
                        ds.loadData(json.data);
                     } else {
                        showError(json.errMessage, 'BarChart');
                     }
                  },
                  failure: function() {
                     showError('BarChart failed');
                  }
               });

               chart[c].store = ds;

               break;
            }

            //				case Senate.fd.LineChart: {					
            //					var ds = new Ext.data.JsonStore({
            //						fields: chart[c].fields
            //					});
            //					
            //					Ext.Ajax.request({
            //						url: Senate.url.Store,
            //						method: 'POST',
            //						params: { tbID: chart[c].tbID, names: Ext.util.JSON.encode(chart[c].fields) },
            //						success: function(result) {							
            //							var json = Ext.util.JSON.decode(result.responseText);
            //							
            //							if (json.success) {
            //								ds.loadData(json.data);
            //							}
            //							else {
            //								showError(json.errMessage, 'LineChart');
            //							}
            //						},
            //						failure: function() {
            //							showError('LineChart failed');
            //						}
            //					});
            //					
            //					chart[c].store = ds;
            //					
            //					break;
            //				}
         }
      }
   }

   panel.doLayout();

   for (t in tabPage) {
      if (typeof tabPage[t] == 'object') {
         for (var i = 0; i < tabPage[t].items.length; i++) {
            tabPage[t].activate(tabPage[t].items.get(i));
         }
         tabPage[t].setActiveTab(0);
      }
   }

   var pk = panel.findById('primary-key-' + panel.fmID);
   if (pk != null) {
      var keyValue = pk.getValue();
      if (panel.pID != undefined) {
         pk.setValue(keyValue + '|' + panel.pID);
      }
      return keyValue;
   }
   return null;
}

Senate.FormWindow = function() {
   Senate.FormWindow.superclass.constructor.call(this, {
      layout: 'fit',
      ctCls: 'body-panel',
      margins: '0 5 0 0',
      padding: 5,
      width: 600,
      height: 400,
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
      listeners: {
         resize: function(win, w, h) {
            win.isResize = true;
         }
      }
   });
};

Ext.extend(Senate.FormWindow, Ext.Window, {
   initComponent: function() {
      Senate.FormWindow.superclass.initComponent.call(this);
   },

	showMulti: function(refPanel, fmID, refGrid, btnIndex, scriptText, fmWidth, fmHeight) {debugger;
		var bd = Ext.getBody();
		var wd = Math.max(0, (bd.getWidth() - 80)); wd = wd > 1100 ? 1100 : wd;
		var hh = Math.max(0, (bd.getHeight() - 20)); hh = hh > 800 ? 800 : hh;
		
		if (fmWidth && fmHeight) {
			if (fmWidth == 0 && fmHeight == 0) this.setSize(wd, hh);
			else this.setSize(fmWidth, fmHeight);
		} else {
			this.setSize(wd, hh);
		}

		/*var fid = 'win-form';
		if (Ext.getCmp('win-form')) {
		   fid = 'swin-form';
		}*/
		var fid = 'win-form';
		if (Ext.getCmp('xwin-form')) {
			fid = 'zwin-form';
		} else if (Ext.getCmp('swin-form')) {
			fid = 'xwin-form';
		} else if (Ext.getCmp('win-form')) {
			fid = 'swin-form';
		} else if (Ext.getCmp('pwin-form')) {
			fid = 'qwin-form';
		} else if (Ext.getCmp('owin-form')) {
			fid = 'pwin-form';
		}

		Senate.winID = fid;
		Senate.refPanel = refPanel;
		Senate.refGrid = refGrid;

		var win = this;
		var form = new Senate.MainForm({
			id: fid,
			fmID: fmID,
			mainBody: this,
			isWindow: true,
			btnIndex: btnIndex,
			bodyStyle: 'overflow-y: scroll',
			srcParams: refGrid.srcParams,
			listeners: {
				'afterlayout': function() {
					if (form.details) {
						var refStore = refGrid.getStore();
						if (!refGrid.tempRec) {
							refGrid.tempRec = new Array();
						}

						var grid = form.details[0];
						if (grid && grid.fdType == Senate.fd.GridMulti) {
							grid.selRec = new Array();
							for (var i = 0; i < refStore.getCount(); i++) {
								var r = refStore.getAt(i);
								var keys = r.get(grid.isPK[0]) + ':' + r.get(grid.isPK[1]);
								grid.selRec[keys] = r;
								refGrid.tempRec[keys] = r;
							}
						}
					}
				}
			}
		});

		this.add(form);
		this.getTopToolbar().add('->');
		this.getTopToolbar().add(new Ext.Button({
			text: 'Filter',
			handler: function() {
				var panel = Ext.getCmp(fid);
				var filterStr = '';
				for (var i = 0; i < panel.dataFields.length; i++) {
					var field = panel.dataFields;
					if (panel.findById(field[i]) != null) {
						var f = panel.findById(field[i]);
						var fieldName = f.getName();
						var fieldValue = f.getValue();
						if (f.tfType == Senate.tf.DateTime) {
							fieldValue = f.getRawValue();
						}
						filterStr += (fieldName + ';' + fieldValue + ';' + f.tfType);
						if (i < panel.dataFields.length - 1) {
							filterStr += '|';
						}
					}
				}

				var grid = panel.details[0];

				grid.getStore().setBaseParam('filterStr', filterStr);
				grid.filterStr = filterStr;

				if (panel.extSearch) {
					var str = Ext.getCmp(panel.extSearch.field).getValue();
					grid.getStore().setBaseParam('extSearch', str + ';' + panel.extSearch.expr);
					grid.extSearch = str + ';' + panel.extSearch.expr;
				}
				if (grid.aggList) {
					grid.getStore().setBaseParam('aggList', Ext.util.JSON.encode(grid.aggList));
				}

				var gstore = grid.getStore();
				if (gstore.baseParams.temp) {
					gstore.setBaseParam('tbID', gstore.baseParams.temp);
				}
				grid.getStore().load();
			}
		}));

		this.addButton(new Ext.Button({
			text: 'Select',
			handler: function() {
				var grid = form.details[0];

				if (form.fmID != 4002065) {
					if (grid.fdType == Senate.fd.GridMulti) {
						var store = refGrid.getStore();
						store.removeAll();
					}

					var seq = undefined;
					if (refGrid.isRunning.length == 0) {
						var store = refGrid.getStore();
						var count = store.getCount();

						if (count == 0) {
							seq = 1;
						} else {
							//var last = store.getAt(count - 1).data;
							//seq = last['Seq'] + 1;

							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							seq = max + 1;
						}
					}
debugger;
					var ff = refPanel.getForm();
					var mainGrid = null;
					var parentGrid = null;
					var iseq = ff.findField('ISeq');
					var iseqVal;
					var mainSeq = 0;
					var parentSeq = 0;
					var relateGrid = refGrid.relateGrid;
					var haveRelateField = (relateGrid ? true : false);
					var relateFieldList = refGrid.relateField;
					var relateTBID = refGrid.relateTBID;
					var haveRseqField = false;
					if (iseq) {
						iseqVal = iseq.getValue();
						seq = 0;
						// Apichart.s Added for Auto Seq Value
						var fmain = Ext.getCmp('main-form');
						for (var i = 0; i < fmain.details.length; i++) {
							var g = fmain.details[i];
							var gTBID = g.tbID;
							if (gTBID == refGrid.tbID) {
								mainGrid = g;
								break;
							}
						}
						var store = mainGrid.getStore();
						var count = store.getCount();
						if (count == 0) {
							mainSeq = 1;
						} else {
							//var last = store.getAt(count - 1).data;
							//mainSeq = last['Seq'] + 1;
							
							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							mainSeq = max + 1;
						}

						//if(seq == 1){
						var parentFid = refPanel.getId();
/* 						if (parentFid == 'zwin-form') {
							parentFid = 'xwin-form';
						} else if (parentFid == 'xwin-form') {
							parentFid = 'swin-form';
						} else if (parentFid == 'swin-form') {
							parentFid = 'win-form';
						} else if (parentFid == 'qwin-form') {
							parentFid = 'pwin-form';
						} else if (parentFid == 'pwin-form') {
							parentFid = 'owin-form';
						} else parentFid = 'main-form'; */

						var parentForm = Ext.getCmp(parentFid);
						for (var i = 0; i < parentForm.details.length; i++) {
							var g = parentForm.details[i];
							var gTBID = g.tbID;
							if (gTBID == refGrid.tbID) {
								parentGrid = g;
								break;
							}
						}

						store = parentGrid.getStore();
						count = store.getCount();
						if (count == 0) {
							parentSeq = 1;
						} else {
							//var last = store.getAt(count - 1).data;
							//parentSeq = last['Seq'] + 1;
							
							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							parentSeq = max + 1;
							
						}

						seq = (parentSeq > mainSeq) ? parentSeq : mainSeq;

						for (var i = 1; i < mainGrid.getColumnModel().config.length; i++) {
							var dataIdx = mainGrid.getColumnModel().getDataIndex(i);
							if (dataIdx == 'rseq') {
								haveRseqField = true;
								break;
							}
						}
					}

					var frm = Ext.getCmp('main-form').getForm();
					var rec = grid.selRec;
					var temp = refGrid.tempRec;
					if(grid.fdType != Senate.fd.GridSelect){
						for (r in rec) {
							if (typeof rec[r] != 'function') {
								if (haveRseqField) {
									if (haveRelateField) {
										var rlFD = relateFieldList.split('|');
										for (var y = 0; y < rlFD.length; y++) {
											var fieldName = rlFD[y];
											var relateField = haveRelateField ? ff.findField(fieldName) : null;
											var relateValue = haveRelateField ? relateField.getValue() : null;
											rec[r].set(fieldName, relateValue);
										}
									} else {
										var rseq = rec[r].data.rseq;
										if (!rseq) rec[r].data.rseq = seq;
									}
								}
								/*if(haveRseqField ){
								  var rseq = rec[r].data.rseq;
								  if(!rseq)  rec[r].data.rseq = seq;
							  } */
								if (seq) {
									rec[r].data.Seq = seq;
									seq++;
								}
								if (iseq) {
									rec[r].data.ISeq = iseqVal;
								}

								if (temp[r]) {
									rec[r] = temp[r];
								}
								refGrid.store.add(rec[r]);
							}
						}
					}else{	
						if (haveRseqField) {
							if (haveRelateField) {
								var rlFD = relateFieldList.split('|');
								for (var y = 0; y < rlFD.length; y++) {
									var fieldName = rlFD[y];
									var relateField = haveRelateField ? ff.findField(fieldName) : null;
									var relateValue = haveRelateField ? relateField.getValue() : null;
									rec[fieldName] = relateValue;
								}
							} else {
								var rseq = rec['rseq'];
								if (!rseq) rec['rseq'] = (seq  == undefined ? 1 : seq);
							}
						}
						if (seq) {
							rec['Seq'] = seq;
							seq++;
						}
						if (iseq) {
							rec['ISeq'] = iseqVal;
						}
						var recType = grid.getStore().recordType;
						refGrid.store.add(new recType(rec));
					}
					
					debugger;
					var cols = [];
					var cm = grid.getColumnModel();
					for (var j = 0; j < cm.getColumnCount(); j++) {
						var col = cm.getColumnAt(j);
						if (col.isRequire && Number(col.isRequire) == 1) cols.push(cm.getDataIndex(j));
					}

					cm = refGrid.getColumnModel();
					for (var j = 0; j < cm.getColumnCount(); j++) {
						var col = cm.getColumnAt(j);
						for (var k = 0; k < cols.length; k++) {
							if (col.dataIndex == cols[k]) {
								col.isRequire = 1;
								break;
							}
						}
					}
				}

				if (scriptText) {
					//console.log('>> multi-select update');
					debug(scriptText, {
						fdName: refGrid.fdName,
						index: btnIndex
					});
				}

				if (fid == 'zwin-form') {
					fid = 'xwin-form';
				} else if (fid == 'xwin-form') {
					fid = 'swin-form';
				} else if (fid == 'swin-form') {
					fid = 'win-form';
				} else if (fid == 'qwin-form') {
					fid = 'pwin-form';
				} else if (fid == 'pwin-form') {
					fid = 'owin-form';
				} else fid = 'main-form';

				Senate.winID = fid;

				win.close();
				win.destroy();
			}
		}));
		this.addButton(new Ext.Button({
			text: 'Close',
			handler: function() {
				if (fid == 'zwin-form') {
					fid = 'xwin-form';
				} else if (fid == 'xwin-form') {
					fid = 'swin-form';
				} else if (fid == 'swin-form') {
					fid = 'win-form';
				} else if (fid == 'qwin-form') {
					fid = 'pwin-form';
				} else if (fid == 'pwin-form') {
					fid = 'owin-form';
				} else fid = 'main-form';

				Senate.winID = fid;
				Senate.refPanel = null;
				Senate.refGrid = null;

				win.close();
				win.destroy();
			}
		}));
		this.doLayout();
		this.show();
	},
	
	showMultiFilter: function(refPanel, fmID, refGrid, btnIndex, scriptText, fmWidth, fmHeight) {debugger;
		var bd = Ext.getBody();
		var wd = Math.max(0, (bd.getWidth() - 80)); wd = wd > 1100 ? 1100 : wd;
		var hh = Math.max(0, (bd.getHeight() - 20)); hh = hh > 800 ? 800 : hh;

		if (fmWidth && fmHeight) {
			if (fmWidth == 0 && fmHeight == 0) this.setSize(wd, hh);
			else this.setSize(fmWidth, fmHeight);
		} else {
			this.setSize(wd, hh);
		}

		/*var fid = 'win-form';
		if (Ext.getCmp('win-form')) {
		   fid = 'swin-form';
		}*/
		var fid = 'win-form';
		if (Ext.getCmp('xwin-form')) {
			fid = 'zwin-form';
		} else if (Ext.getCmp('swin-form')) {
			fid = 'xwin-form';
		} else if (Ext.getCmp('win-form')) {
			fid = 'swin-form';
		} else if (Ext.getCmp('pwin-form')) {
			fid = 'qwin-form';
		} else if (Ext.getCmp('owin-form')) {
			fid = 'pwin-form';
		}

		Senate.winID = fid;
		Senate.refPanel = refPanel;
		Senate.refGrid = refGrid;

		var win = this;
		var form = new Senate.MainForm({
			id: fid,
			fmID: fmID,
			mainBody: this,
			isWindow: true,
			btnIndex: btnIndex,
			bodyStyle: 'overflow-y: scroll',
			srcParams: refGrid.srcParams,
			listeners: {
				'afterlayout': function() {
					if (form.details) {
						var refStore = refGrid.getStore();
						if (!refGrid.tempRec) {
							refGrid.tempRec = new Array();
						}

						var grid = form.details[0];
						if (grid && grid.fdType == Senate.fd.GridMulti) {
							grid.selRec = new Array();
							for (var i = 0; i < refStore.getCount(); i++) {
								var r = refStore.getAt(i);
								var keys = r.get(grid.isPK[0]) + ':' + r.get(grid.isPK[1]);
								grid.selRec[keys] = r;
								refGrid.tempRec[keys] = r;
							}
						}
					}
				}
			}
		});
		this.add(form);
		this.getTopToolbar().add('->');
		this.getTopToolbar().add(new Ext.Button({
			text: 'Filter',
			handler: function() {
				var panel = Ext.getCmp(fid);
				var filterStr = '';
				for (var i = 0; i < panel.dataFields.length; i++) {
					var field = panel.dataFields;
					if (panel.findById(field[i]) != null) {
						var f = panel.findById(field[i]);
						var fieldName = f.getName();
						var fieldValue = f.getValue();
						if (f.tfType == Senate.tf.DateTime) {
							fieldValue = f.getRawValue();
						}
						filterStr += (fieldName + ';' + fieldValue + ';' + f.tfType);
						if (i < panel.dataFields.length - 1) {
							filterStr += '|';
						}
					}
				}

				var grid = panel.details[0];

				grid.getStore().setBaseParam('filterStr', filterStr);
				grid.filterStr = filterStr;

				if (panel.extSearch) {
					var str = Ext.getCmp(panel.extSearch.field).getValue();
					grid.getStore().setBaseParam('extSearch', str + ';' + panel.extSearch.expr);
					grid.extSearch = str + ';' + panel.extSearch.expr;
				}
				if (grid.aggList) {
					grid.getStore().setBaseParam('aggList', Ext.util.JSON.encode(grid.aggList));
				}

				var gstore = grid.getStore();
				if (gstore.baseParams.temp) {
					gstore.setBaseParam('tbID', gstore.baseParams.temp);
				}
				grid.getStore().load();
			}
		}));

		this.addButton(new Ext.Button({
			text: 'Select',
			handler: function() {

				var grid = form.details[0];

				if (form.fmID != 4002065) {
					if (grid.fdType == Senate.fd.GridMulti) {
						var store = refGrid.getStore();
						store.removeAll();
					}

					var seq = undefined;
					if (refGrid.isRunning.length == 0) {
						var store = refGrid.getStore();
						var count = store.getCount();

						if (count == 0) {
							seq = 1;
						} else {
							//var last = store.getAt(count - 1).data;
							//seq = last['Seq'] + 1;

							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							seq = max + 1;
						}
					}
debugger;
					var ff = refPanel.getForm();
					var mainGrid = null;
					var parentGrid = null;
					var iseq = ff.findField('ISeq');
					var iseqVal;
					var mainSeq = 0;
					var parentSeq = 0;
					var relateGrid = refGrid.relateGrid;
					var haveRelateField = (relateGrid ? true : false);
					var relateFieldList = refGrid.relateField;
					var relateTBID = refGrid.relateTBID;
					var haveRseqField = false;
					if (iseq) {
						iseqVal = iseq.getValue();
						seq = 0;
						// Apichart.s Added for Auto Seq Value
						var fmain = Ext.getCmp('main-form');
						for (var i = 0; i < fmain.details.length; i++) {
							var g = fmain.details[i];
							var gTBID = g.tbID;
							if (gTBID == refGrid.tbID) {
								mainGrid = g;
								break;
							}
						}
						var store = mainGrid.getStore();
						var count = store.getCount();
						if (count == 0) {
							mainSeq = 1;
						} else {
							//var last = store.getAt(count - 1).data;
							//mainSeq = last['Seq'] + 1;

							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							mainSeq = max + 1;
						}

						//if(seq == 1){
						var parentFid = refPanel.getId();
/* 						if (parentFid == 'zwin-form') {
							parentFid = 'xwin-form';
						} else if (parentFid == 'xwin-form') {
							parentFid = 'swin-form';
						} else if (parentFid == 'swin-form') {
							parentFid = 'win-form';
						} else if (parentFid == 'qwin-form') {
							parentFid = 'pwin-form';
						} else if (parentFid == 'pwin-form') {
							parentFid = 'owin-form';
						} else parentFid = 'main-form'; */

						var parentForm = Ext.getCmp(parentFid);
						for (var i = 0; i < parentForm.details.length; i++) {
							var g = parentForm.details[i];
							var gTBID = g.tbID;
							if (gTBID == refGrid.tbID) {
								parentGrid = g;
								break;
							}
						}

						store = parentGrid.getStore();
						count = store.getCount();
						if (count == 0) {
							parentSeq = 1;
						} else {
							//var last = store.getAt(count - 1).data;
							//parentSeq = last['Seq'] + 1;

							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							parentSeq = max + 1;
						}

						seq = (parentSeq > mainSeq) ? parentSeq : mainSeq;

						for (var i = 1; i < mainGrid.getColumnModel().config.length; i++) {
							var dataIdx = mainGrid.getColumnModel().getDataIndex(i);
							if (dataIdx == 'rseq') {
								haveRseqField = true;
								break;
							}
						}
					}

					var frm = Ext.getCmp('main-form').getForm();
					var rec = grid.selRec;
					var temp = refGrid.tempRec;
					for (r in rec) {
						if (typeof rec[r] != 'function') {
							if (haveRseqField) {
								if (haveRelateField) {
									var rlFD = relateFieldList.split('|');
									for (var y = 0; y < rlFD.length; y++) {
										var fieldName = rlFD[y];
										var relateField = haveRelateField ? ff.findField(fieldName) : null;
										var relateValue = haveRelateField ? relateField.getValue() : null;
										rec[r].set(fieldName, relateValue);
									}
								} else {
									var rseq = rec[r].data.rseq;
									if (!rseq) rec[r].data.rseq = seq;
								}
							}
							/*if(haveRseqField ){
							  var rseq = rec[r].data.rseq;
							  if(!rseq)  rec[r].data.rseq = seq;
						  } */
							if (seq) {
								rec[r].data.Seq = seq;
								seq++;
							}
							if (iseq) {
								rec[r].data.ISeq = iseqVal;
							}

							if (temp[r]) {
								rec[r] = temp[r];
							}
							refGrid.store.add(rec[r]);
						}
					}
					debugger;
					var cols = [];
					var cm = grid.getColumnModel();
					for (var j = 0; j < cm.getColumnCount(); j++) {
						var col = cm.getColumnAt(j);
						if (col.isRequire && Number(col.isRequire) == 1) cols.push(cm.getDataIndex(j));
					}

					cm = refGrid.getColumnModel();
					for (var j = 0; j < cm.getColumnCount(); j++) {
						var col = cm.getColumnAt(j);
						for (var k = 0; k < cols.length; k++) {
							if (col.dataIndex == cols[k]) {
								col.isRequire = 1;
								break;
							}
						}
					}
				}

				if (scriptText) {
					//console.log('>> multi-select update');
					debug(scriptText, {
						fdName: refGrid.fdName,
						index: btnIndex
					});
				}

				if (fid == 'zwin-form') {
					fid = 'xwin-form';
				} else if (fid == 'xwin-form') {
					fid = 'swin-form';
				} else if (fid == 'swin-form') {
					fid = 'win-form';
				} else if (fid == 'qwin-form') {
					fid = 'pwin-form';
				} else if (fid == 'pwin-form') {
					fid = 'owin-form';
				} else fid = 'main-form';

				Senate.winID = fid;

				win.close();
				win.destroy();
			}
		}));
		this.addButton(new Ext.Button({
			text: 'Close',
			handler: function() {
				if (fid == 'zwin-form') {
					fid = 'xwin-form';
				} else if (fid == 'xwin-form') {
					fid = 'swin-form';
				} else if (fid == 'swin-form') {
					fid = 'win-form';
				} else if (fid == 'qwin-form') {
					fid = 'pwin-form';
				} else if (fid == 'pwin-form') {
					fid = 'owin-form';
				} else fid = 'main-form';

				Senate.winID = fid;
				Senate.refPanel = null;
				Senate.refGrid = null;

				win.close();
				win.destroy();
			}
		}));
		this.doLayout();
		this.show();
	},

   showFilter: function(fmID, panel, params, scriptText) {
      var bd = Ext.getBody();
      this.setSize(Math.max(720, (bd.getWidth() - 80)), Math.max(450, (bd.getHeight() - 80)));

      var win = this;
	  var fid = 'filter-form';
	  Senate.winID = fid;
	  Senate.refPanel = panel;
	  Senate.refGrid = null;
	  
      var form = new Senate.MainForm({
         id: fid,
         fmID: fmID,
         mainBody: this,
         isWindow: true,
         bodyStyle: 'overflow-y: scroll',
         srcParams: params,
         listeners: {
            'afterlayout': function() {

            }
         }
      });
      this.add(form);
      this.getTopToolbar().add('->');
      this.getTopToolbar().add(new Ext.Button({
         text: 'Filter',
         handler: function() {
            var panel = Ext.getCmp(fid);
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
               grid.filterStr = filterStr;
               if (panel.extSearch) {
                  var str = Ext.getCmp(panel.extSearch.field).getValue();
                  grid.getStore().setBaseParam('extSearch', str + ';' + panel.extSearch.expr);
                  grid.extSearch = str + ';' + panel.extSearch.expr;
               }
               if (grid.aggList) {
                  grid.getStore().setBaseParam('aggList', Ext.util.JSON.encode(grid.aggList));
               }

               var gstore = grid.getStore();
               if (gstore.baseParams.temp) {
                  gstore.setBaseParam('tbID', gstore.baseParams.temp);
               }
               grid.getStore().load();
            }
         }
      }));
      this.addButton(new Ext.Button({
         text: 'Select',
         handler: function() {
            var grid = Ext.getCmp(fid).details[0];
            if (grid) {
               var frm = panel.getForm();
               var rec = grid.selRec;
			   
               for (r in rec) {
                  if (typeof rec[r] != 'function') {
                     var field = frm.findField(r);
                     if (field != null) {

                        if (field.getXType() == 'combo') {
                           field.setValue(rec[r]);
                           field.refField.setValue(rec[r]);
                        } else if (field.tfType == Senate.tf.DateTime || field.tfType == Senate.tf.Time) {
                           var dstr = rec[r];

                           // [ASP.NET begin]
                           var date = Date.parseDate(dstr, 'd/m/Y H:i:s');
                           if (!date) {
                              date = Date.parseDate(dstr, 'd/m/Y');
                           }
                           field.setValue(date);
                           // [end]

                           // [J2EE begin]
                           //								var dt = dstr.substring(0, dstr.lastIndexOf('.'));
                           //								field.setValue(Date.parseDate(dt, 'd/m/Y H:i:s'));
                           // [end]
                        } else if (field.linkId != undefined) {
                           field.setValue(rec[r]);
                           Ext.getCmp(field.linkId).setValue(rec[r]);
                        } else {
                           field.setValue(rec[r]);
                        }

                        if (field.getXType() == 'numberfield' || field.getXType() == 'numberfield3') {
                           field.fireEvent('blur', field);
                        }
                     }
                  }
               }
			   
            }

            if (scriptText) {
               var pp = {};
               if (grid && grid.getSelectionModel().getSelected()) {
                  pp.rec = grid.getSelectionModel().getSelected().data;
               }
               debug(scriptText, pp);
            }
	    
	    Senate.winID = panel.getId();
			
            win.close();
            win.destroy();
         }
      }));
      this.addButton(new Ext.Button({
         text: 'Close',
         handler: function() {
	 	Senate.winID = panel.getId();
		Senate.refPanel = null;
		Senate.refGrid = null;
			
            win.close();
            win.destroy();
         }
      }));
      this.doLayout();
      this.show();
   },


   showTemplate: function(fmID, pID) {
      this.setSize(800, 480);

      var win = this;
      var form = new Senate.MainForm({
         id: 'twin-form',
         fmID: fmID,
         mainBody: this,
         isWindow: true,
         bodyStyle: 'overflow-y: scroll'

         //pID: pID
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
   },

	validateForm: function(form, p = null) {
		return validationForm(form, p);
/*		
		var fItems = form.items;
		var blankColumn = null;
		var blankField = null;
		var errorMsg = null;
		var errorItem = null;
		for (var i = 0; i < fItems.length; i++) {
			var item = fItems.get(i);
			errorItem = item;
			var type = item.getXType();
			if (type == 'textfield' || type == 'textarea') {
				var val = item.getValue();
				if (val) {
					item.setValue(val.toString().trim());
				}
			}
			else if (type == 'compositefield') { // Begin - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
				var val = item.items.items[1].value;
				try {
					if (get_field(item.id.split('-').pop(), true).allowBlank != undefined) {
						if (!get_field(item.id.split('-').pop(), true).allowBlank) {
							blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
							if (!val) {
								if (!blankField) blankField = 'กรุณากรอกข้อมูล "Attach File"';
								break;
							} else {
								blankField = undefined;
							}
						}
					}
				} catch {}
			} // End - Apichart.S:20190301 - Fix validate Attach File when on form load set allowBlank = false
	
			if (!item.isValid() && item.fieldLabel != undefined) {
				if (!item.hidden) {
					blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
					if (blankField) break;
				} else if (item.getXType() == 'numberfield' || item.getXType() == 'numberfield3') {
					blankField = item.fieldLabel.replace(/(<([^>]+)>)/ig, '');
					if (blankField) break;
				}
			} 
			else if (item.markError) {
				errorMsg = item.markError;
			}
		}
	  
		if(p && !blankField){debugger;
			var details = p.details;
			for (var i = 0; i < details.length; i++) {
				if (!details[i].isReadOnly) {
					var tb = {};
					tb['table'] = details[i].tbName;
					tb['rem'] = details[i].removeRows;
					// [end]
					tb['edit'] = details[i].editRows;
					tb['pk'] = details[i].isPK;
					tb['running'] = details[i].isRunning;
					tb['max'] = details[i].isMax;
					tb['rel'] = details[i].relString;

					var cols = [];
					var cm = details[i].getColumnModel();
					for (var j = 0; j < cm.getColumnCount(); j++) {
						var col = cm.getColumnAt(j);
						if(col.isRequire && Number(col.isRequire) == 1) cols.push(cm.getDataIndex(j));
					}

					var store = details[i].getStore();
					var data = null;
					var editData = null;
					for (var j = 0; j < store.getCount(); j++) {
						if(!blankField) break;
						var rec = store.getAt(j);
						var rows = [];
						for (var k = 1; k < cols.length; k++) {
							if (rec.get(cols[k]) == undefined) {
								blankField = cols[k];
								break;
							} 
							else {
								var s = rec.get(cols[k]) || undefined;
								if(!s) {
									blankField = cols[k];
									break;
								}
							}
						}
					}
				}
			}
		}
	  
		if (!form.isValid() || blankField) {
			showError('กรุณากรอกข้อมูล "' + blankField + '"', 'ข้อความ');
			return false;
		}
		if (errorMsg) {
			showError(errorMsg, 'ข้อความ');
			return false;
		}
		return true; 
*/		
   },

   showForm: function(refPanel, fmID, grid, width, height, rowIndex, customId) {debugger;
	var bd = Ext.getBody();
	var wd = Math.max(0, (bd.getWidth() - 80)); wd = wd > 1100 ? 1100 : wd;
	var hh = Math.max(0, (bd.getHeight() - 20)); hh = hh > 800 ? 800 : hh;

	if (width && height) {
		if (width == 0 && height == 0) this.setSize(wd, hh);
		else this.setSize(width, height);
	} else {
		this.setSize(wd, hh);
	}

      var fid = 'win-form';
      if (Ext.getCmp('xwin-form')) {
         fid = 'zwin-form';
      } else if (Ext.getCmp('swin-form')) {
         fid = 'xwin-form';
      } else if (Ext.getCmp('win-form')) {
         fid = 'swin-form';
      }else if (Ext.getCmp('pwin-form')) {
         fid = 'qwin-form';
      } else if (Ext.getCmp('owin-form')) {
         fid = 'pwin-form';
      }
	
      Senate.winID = fid;
	  Senate.refPanel = refPanel;
	  Senate.refGrid = grid;
	  
      /*if (Ext.getCmp('s-' + Ext.getCmp('win-form').items.get(0).id)) {
      fid = 'pwin-form';
      }
      if (refPanel.isViewForm) {
      fid = 's-' + Ext.getCmp('win-form').items.get(0).id;
      }*/

      var win = this;

      var psmtid = undefined;
      if (rowIndex != undefined)
         psmtid = grid.getStore().getAt(rowIndex).data.PSMTID;

      var form = new Senate.MainForm({
         id: fid,
         fmID: fmID,
         mainBody: this,
         isWindow: true,
         isViewForm: refPanel.isViewForm,
         customId: customId,
         viewMode: grid.isReadOnly,
         srcParams: grid.srcParams,
         psmtid: psmtid,
         bodyStyle: 'overflow-y: scroll',
         listeners: {
            'afterlayout': function(container) {
               if (win.isResize) {
                  return;
               }

               if (rowIndex != undefined) {
                  var f = form.getForm();
                  var rec = grid.getStore().getAt(rowIndex);
                  var cm = grid.getColumnModel();
                  for (var j = 0; j < cm.getColumnCount(); j++) {
                     var dataIndex = cm.getDataIndex(j);
                     if (dataIndex != undefined && dataIndex.length > 0) {
                        var field = f.findField(dataIndex);
                        if (field != null) {
                           if (field.getXType() == 'combo') {
							   //console.log(field.name + ' -> combo');
                              field.setValue(rec.get(dataIndex));
                              field.refField.setValue(rec.get(dataIndex));
                           } else if (field.getXType() == 'timefield') {
                              var v = rec.get(dataIndex);
                              var d = new Date(v);
                              if (v == null || d == 'Invalid Date' || isNaN(d)) {
                                 field.setValue(v);
                              } else {
                                 field.setValue(d);
                              }
							   //console.log(field.name + ' -> timefield');
                           } else if (field.getXType() == 'datefield' || field.getXType() == 'monthfield') {
                              var dstr = rec.get(dataIndex);
                              var date = Date.parseDate(dstr, 'd/m/Y H:i:s');
                              if (!date) {
                                 date = Date.parseDate(dstr, 'd/m/Y');
                              }
                              field.setValue(date);
							   //console.log(field.name + ' -> datefield');
                           } else if (field.linkId != undefined) {
                              field.setValue(rec.get(dataIndex));
                              Ext.getCmp(field.linkId).setValue(rec.get(dataIndex));
							   //console.log(field.name + ' -> not linkId');
                           } else if (field.attach) {debugger;
                              var s = rec.get(dataIndex);
                              if (s) {
                                 var div = document.createElement('div');
                                 div.innerHTML = s;
                                 var elm = div.firstChild;
                                 var com = Ext.getCmp('com-' + field.id);
                                 var di = elm.rel;
                                 if (!di) {
									 var dir = elm.attributes['dir'];
									 if(dir != undefined)
										di = elm.attributes['dir'].value;
									else
										di = s;
                                 }

                                 if (di != null) {
                                    var fstr = di.split('|');
                                    var size = 0;
                                    if (fstr.length > 2) {
                                       size = fstr[2];
                                    }
                                    com.updateFile(fstr[1], fstr[0], size);
                                 } else {
                                    var fstr = s.split('|');
                                    var size = 0;
                                    if (fstr.length > 2) {
                                       size = fstr[2];
                                    }
                                    com.updateFile(fstr[1], fstr[0], size);
                                 }
                              }
                           } else {
							  //console.log(field.name + ' -> else');
/* 							  if(field.tfType == Senate.tf.Currency) {
								  field.setValue(Ext.util.Format.number(rec.get(dataIndex), '0,000.00'));
							  }else  */
								  field.setValue(rec.get(dataIndex));
						  
                              if (field.getXType() == 'numberfield' || field.getXType() == 'numberfield3') {
                                 field.fireEvent('blur', field);
                              }
                           }
                        }
                     }
                  }

                  var iseq = f.findField('ISeq');
				  var rseq = f.findField('rseq');
				  var rseqValue = rseq ? rseq.getValue() : null;
				  var iseqValue = iseq ? iseq.getValue() : null;
                  if (iseq) {
                     var seq = rec.get('Seq');
					 if(Ext.isEmpty(iseqValue)) {
						 iseq.setValue(seq);
						 iseqValue = seq;
					 }

                     for (var i = 0; i < refPanel.details.length; i++) {
                        var detGrid = refPanel.details[i];
                        var subGrid = undefined;
                        for (var j = 0; j < container.details.length; j++) {
                           subGrid = container.details[j];
                           if (subGrid.tbID == detGrid.tbID || subGrid.fdName == detGrid.fdName) {
                              var subStore = subGrid.getStore();
                              var detStore = detGrid.getStore();
							  var haveRseqField = false;
								for (var x = 1; x < detGrid.getColumnModel().config.length; x++) {
									var dataIdx = detGrid.getColumnModel().getDataIndex(x);
									if (dataIdx == 'rseq') {
										haveRseqField = true;
										break;
									} 
								}
                              for (var k = 0; k < detStore.getCount(); k++) {
                                 var r = detStore.getAt(k);
								 if(haveRseqField && rseq) {
									 if (r.get('ISeq') == iseqValue && r.get('rseq') == rseqValue) {
										subStore.add(r);
									 }
								  }
                                 else {
									 if (r.get('ISeq') == iseqValue) {
										subStore.add(r);
									 }
                                 }
                              }
                           }
                        }
                     }
                  }
               } else {
                  var ff = container.getForm();
                  var iseq = ff.findField('ISeq');
                  if (iseq) {
                     var seq = undefined;
                     if (grid.isRunning.length == 0) {
                        var store = grid.getStore();
                        var count = store.getCount();
                        if (count == 0) {
                           seq = 1;
                        } else {
                           //var last = store.getAt(count - 1).data;
                           //seq = last['Seq'] + 1;

							var max = 1;
							for (var i = 0; i < count; i++) {
								var data = store.getAt(i).data;
								var xseq = data['Seq'];
								if (xseq > max) {
									max = xseq;
								}
							}
							seq = max + 1;
                        }
                     }
                     iseq.setValue(seq);
                  }
               }
            }
         }
      });
      this.add(form);

      if (rowIndex != undefined) {
         this.addButton(new Ext.Button({
            text: 'OK',
            hidden: grid.isReadOnly,
            handler: function() {
               if (!win.validateForm(form.getForm(), Ext.getCmp(Senate.winID))) {
                  return;
               }

               var rec = grid.getStore().getAt(rowIndex);
               var f = Ext.getCmp(fid);

               for (var i = 0; i < f.dataFields.length; i++) {
                  var field = f.dataFields;
                  var ff = f.getForm().findField(field[i]);
                  if (ff != null) {
                     if (ff.getXType() == 'combo') {
                        if (ff.refField.getValue() != undefined) {
                           if (typeof ff.getValue() != 'number' && ff.getValue() != null && ff.getValue().trim().length == 0) {
                              ff.refField.setValue(null);
                           }

                           rec.set(ff.refField.ctfName, ff.getRawValue());
                           rec.set(ff.getName(), ff.refField.getValue());
                        }
                     } else if (ff.linkId != undefined) {
                        rec.set(ff.getName(), Ext.getCmp(ff.linkId).getValue());
                     } else if (ff.getValue() && (ff.getXType() == 'datefield' || ff.getXType() == 'monthfield')) {
                        rec.set(ff.getName(), ff.getValue().format('d/m/Y'));
                     } else if (ff.getValue() && ff.getXType() == 'timefield') {
                        rec.set(ff.getName(), new Date('1/1/1900 ' + ff.getValue()));
                     } else if (ff.attach) {
                        if (ff.getValue()) {
							if (ff.getValue().search('HREF') == -1) {
							   var file = ff.getValue().split('|');
							   var url = Senate.url.Download + '?name=' + file[1] + '&path=' + file[0];
							   rec.set(ff.getName(), '<a rel="' + ff.getValue() + '" href="' + url + '">' + file[1] + '</a>');
							}else{
								rec.set(ff.getName(), ff.getValue());
							}
							
                        } else {
                           rec.set(ff.getName(), null);
                        }
                     } else {
                        rec.set(ff.getName(), ff.getValue());
                     }
                  }
               }
		   debugger;
               var iseq = f.getForm().findField('ISeq');
               var rseq = f.getForm().findField('rseq');
			   var rseqValue = rseq ? rseq.getValue() : null;
			   var iseqValue =  iseq ? iseq.getValue() : null;
               if (iseq) {
                  //var iseqValue = iseq.getValue();

                  for (var i = 0; i < f.details.length; i++) {
                     var subGrid = f.details[i];
                     var detGrid = undefined;
                     for (var j = 0; j < refPanel.details.length; j++) {
                        detGrid = refPanel.details[j];
                        if (detGrid.tbID == subGrid.tbID) {
                           var detStore = detGrid.getStore();
                           var detRecords = detStore.getRange();
						   var detStoreCount = detStore.getCount();
						   
						   //var last = detStoreCount != 0 ? detStore.getAt(detStore.getCount() - 1).data : null;
						   //var nextSeq = detStoreCount != 0 ? last['Seq'] + 1 : 1;
						   
						   var nextSeq = 1;
						   if(detStoreCount != 0){
							   var count = detStore.getCount();
							   if (count == 0) {
								   nextSeq = 1;
								} else {
									//var last = store.getAt(count - 1).data;
									//seq = last['Seq'] + 1;

									var max = 1;
									for (var x = 0; x < count; x++) {
										var data = detStore.getAt(x).data;
										var xseq = data['Seq'];
										if (xseq > max) {
											max = xseq;
										}
									}
									nextSeq = max + 1;
								}
						   }
						  
						   var haveRseqField = false;
							for (var x = 1; x < detGrid.getColumnModel().config.length; x++) {
								var dataIdx = detGrid.getColumnModel().getDataIndex(x);
								if (dataIdx == 'rseq') {
									haveRseqField = true;
									break;
								} 
							}
						   
                           var pk = detGrid.isPK;
                           var removeRows = subGrid.removeRows;
                           for (var k = 0; k < detStore.getCount(); k++) {
                              var r = detStore.getAt(k);
                              var keyCheck = r.get(pk[0]) + ':' + r.get(pk[1]);

                              for (var m = 0; m < removeRows.length; m++) {
                                 if (removeRows[m] == keyCheck) {
                                    detGrid.pushRemoveRows({
                                       mainKey: r.get(pk[0]),
                                       subKey: r.get(pk[1]),
                                       rowIndex: k,
                                       record: r
                                    });
                                    break;
                                 }
                              }
                           }

                           for (var k = 0; k < detRecords.length; k++) {
                              var r = detRecords[k];
							  if(haveRseqField && rseq) {
								  if (r.get('ISeq') == iseqValue && r.get('rseq') == rseqValue) {
									detStore.remove(r);
								  }
							  }else {
								  if (r.get('ISeq') == iseqValue) {
									detStore.remove(r);
								  }
                              }
                           }
debugger;
							var relateGrid = detGrid.relateGrid;
							var haveRelateField =(relateGrid ? true : false) ;
							var relateFieldList = detGrid.relateField;
							var relateTBID = detGrid.relateTBID;
							
                           var RecType = detStore.recordType;
                           var subStore = subGrid.getStore();
                           var records = subStore.getRange();
                           for (var k = 0; k < records.length; k++) {
								if(haveRelateField) {
									var rlFD = relateFieldList.split('|');
									  for (var y = 0; y < rlFD.length; y++) {
										 var fieldName = rlFD[y];
										 var relateField = haveRelateField ? f.getForm().findField(fieldName) : null;
										 var relateValue = haveRelateField ? relateField.getValue() : null;
										 records[k].set(fieldName, relateValue);
									  }
								}else{
									var rseqVal = records[k].data.rseq;
									if(!rseqVal)  {
										records[k].data.rseq = nextSeq;
										rseqVal = nextSeq;
									}
								}
							   /*if(haveRSeqField){
									var relateGrid = detGrid.relateGrid;
									if(relateGrid) {
										var relateField = detGrid.relateField;
									}else{
										var rseq = records[k].data.rseq;
										if(!rseq)  records[k].data.rseq = nextSeq;
									}
							   } */
							   if(!records[k].data.Seq) {
								   records[k].data.Seq = nextSeq;
								   nextSeq = nextSeq + 1;
							   }
                              detStore.add(new RecType(records[k].data));
                           }

                           var editRows = subGrid.editRows;
                           for (var k = 0; k < editRows.length; k++) {
                              detGrid.pushEditRows({
                                 fullKey: editRows[k]
                              });
                           }
			   break;
                        }
                     }
                  }
               }
			
               if (Ext.getCmp('main-form').pID != undefined) {
                  var pk = grid.isPK;
                  grid.pushEditRows({
                     mainKey: rec.get(pk[0]),
                     subKey: rec.get(pk[1]),
                     rowIndex: rowIndex
                  });
               }

               var _DocType = Number(get_value('DocType', false));
               var _qo = 12001;
               var _li = 12002;

               if (_DocType == _li && get_winFmID() == 1) {
                  var _grid = get_grid('grid_equip', true);

                  var img = Ext.query('#' + _grid.id + ' .x-action-col-1');
                  for (var i = 0; i < img.length; i++) {
                     img[i].parentNode.removeChild(img[i]);
                     img[i].style.display = "none";
                     //img[i].setAttribute("style", "display:none;");
                  }
               }
	       if (fid == 'zwin-form') {
	       	fid = 'xwin-form';
	       } else if (fid == 'xwin-form') {
	       	fid = 'swin-form';
	       } else if (fid == 'swin-form') {
	       	fid = 'win-form';
	       }else if (fid == 'qwin-form') {
	       	fid = 'pwin-form';
	       } else if (fid == 'pwin-form') {
	       	fid = 'owin-form';
	       }else fid = 'main-form';
	       
	       Senate.winID = fid;
				
               win.close();
               win.destroy();
            }
         }));
      } else {
         this.addButton(new Ext.Button({
            text: 'Add',
            handler: function() {
               if (!win.validateForm(form.getForm(), Ext.getCmp(Senate.winID))) {
                  return;
               }

               var Rec = grid.getStore().recordType;
               var json = {};
               var f = Ext.getCmp(fid);
               for (var i = 0; i < f.dataFields.length; i++) {
                  var field = f.dataFields;
                  var ff = f.getForm().findField(field[i]);
                  if (ff != null) {
                     if (ff.getXType() == 'combo') {
                        json[ff.refField.ctfName] = ff.getRawValue();
                        json[ff.getName()] = ff.refField.getValue();
                     } else if (ff.linkId != undefined) {
                        json[ff.getName()] = Ext.getCmp(ff.linkId).getValue();
                     } else if (ff.getXType() == 'hidden' && ff.attach) {
						 if (ff.getValue()) {
							if (ff.getValue().search('HREF') == -1) {
								var file = ff.getValue().split('|');
								var url = Senate.url.Download + '?name=' + file[1] + '&path=' + file[0];
								json[ff.getName()] = '<a rel="' + ff.getValue() + '" href="' + url + '">' + file[1] + '</a>';
							}else{
								json[ff.getName()] = ff.getValue();
							}
                        } else {
                           json[ff.getName()] = null;
                        }
                     } else if (ff.getValue() && (ff.getXType() == 'datefield' || ff.getXType() == 'monthfield')) {
                        json[ff.getName()] = ff.getValue().format('d/m/Y');
                     } else if (ff.getValue() && ff.getXType() == 'timefield') {
                        json[ff.getName()] = new Date('1/1/1900 ' + ff.getValue());
                     } else {
                        json[ff.getName()] = ff.getValue();
                     }
                  }
               }

               var seq = undefined;
               if (grid.isRunning.length == 0) {
                  var store = grid.getStore();
                  var count = store.getCount();
                  if (count == 0) {
                     seq = 1;
                  } else {
                     //var last = store.getAt(count - 1).data;
                     //seq = last['Seq'] + 1;

					var max = 1;
					for (var i = 0; i < count; i++) {
						var data = store.getAt(i).data;
						var xseq = data['Seq'];
						if (xseq > max) {
							max = xseq;
						}
					}
					seq = max + 1;
                  }
                  json['Seq'] = seq;
               }

               var ff = refPanel.getForm();
               var iseq = ff.findField('ISeq');
               if (iseq) {
                  json['ISeq'] = iseq.getValue();
               }

               var r = new Rec(json);
               grid.store.add(r);

               if (f.details) {
                  for (var i = 0; i < f.details.length; i++) {
                     var subGrid = f.details[i];
                     var detGrid = undefined;
                     for (var j = 0; j < refPanel.details.length; j++) {
                        detGrid = refPanel.details[j];
                        if (detGrid.tbID == subGrid.tbID) {
                           var detStore = detGrid.getStore();
                           var subStore = subGrid.getStore();

                           for (var k = 0; k < subStore.getCount(); k++) {
                              var rec = subStore.getAt(k);
                              detStore.add(rec);
                           }
                        }
                     }
                  }
               }
	       
	       if (fid == 'zwin-form') {
	       	fid = 'xwin-form';
	       } else if (fid == 'xwin-form') {
	       	fid = 'swin-form';
	       } else if (fid == 'swin-form') {
	       	fid = 'win-form';
	       }else if (fid == 'qwin-form') {
	       	fid = 'pwin-form';
	       } else if (fid == 'pwin-form') {
	       	fid = 'owin-form';
	       }else fid = 'main-form';
			  
	       Senate.winID = fid;
	       
               win.close();
               win.destroy();
            }
         }));
      }
      this.addButton(new Ext.Button({
         text: 'Close',
         handler: function() {
	 	if (fid == 'zwin-form') {
			fid = 'xwin-form';
		} else if (fid == 'xwin-form') {
			fid = 'swin-form';
		} else if (fid == 'swin-form') {
			fid = 'win-form';
		}else if (fid == 'qwin-form') {
			fid = 'pwin-form';
		} else if (fid == 'pwin-form') {
			fid = 'owin-form';
		}else fid = 'main-form';
		
		Senate.winID = fid;
		Senate.refPanel = null;
		Senate.refGrid = null;
		
            win.close();
            win.destroy();
         }
      }));
      this.doLayout();
      this.show();
      refPanel.mainBody.showLoading();

      this.isResize = false;
   },

   showInfo: function(fmID, panel, keyValue) {
      this.setSize(800, 480);

      var win = this;
      var form = new Senate.MainForm({
         id: 'win-form',
         fmID: fmID,
         mainBody: this,
         isWindow: true,
         bodyStyle: 'overflow-y: scroll',
         listeners: {
            'afterlayout': function() {
               if (form.getForm().findField('PK') != null) {
                  var pk = form.getForm().findField('PK').getValue();
                  var key = pk.split('|')[1];

                  var val = panel.inboxKey;
                  if (keyValue) {
                     val = keyValue;
                  }
                  if (val == undefined) {
                     val = panel.getForm().findField(key).getValue();
                     panel.inboxKey = val;
                  }
                  loadForm(form, val, panel.mainBody, pk);
               }
            }
         }
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
   },

   showLoading: function() {},

   hideLoading: function() {}
});

function testScript(panel) {
   var form = panel.getForm();
   var f = form.findField('FirstName').getValue();
   var l = form.findField('LastName').getValue();
   var t = form.findField('Total');
   t.setValue(parseFloat(f) + parseFloat(l));
}

//create reusable renderer
Ext.util.Format.comboRenderer = function(combo) {
   return function(value) {
      var record = combo.findRecord(combo.valueField, value);
      return record ? record.get(combo.displayField) : value;
   };
};

Ext.form.HtmlEditor.Image = Ext.extend(Ext.util.Observable, {
   init: function(cmp) {
      this.cmp = cmp;
      this.cmp.on('render', this.onRender, this);
   },
   onRender: function() {
      this.cmp.getToolbar().insertButton(11, [{
         editor: this.cmp,
         iconCls: 'x-edit-insertimg',
         handler: function(btn) {
            var win = new Ext.Window({
               id: 'upload-win',
               layout: 'fit',
               ctCls: 'body-panel',
               padding: 5,
               width: 400,
               height: 110,
               autoScroll: true,

               closeAction: 'hide',
               closable: false,
               resizable: false,
               modal: true,
               draggable: false,

               editor: btn.editor,

               buttonAlign: 'center',
               buttons: [
                  new Ext.Button({
                     text: 'Insert',
                     handler: function(btn) {
                        var w = btn.ownerCt.ownerCt;
                        w.editor.focus();
                        w.editor.updateToolbar();

                        var fp = w.items.get(0).getForm();
                        fp.submit({
                           url: Senate.url.UploadImage,
                           waitMsg: 'Uploading your image...',
                           success: function(f, result) {
                              var data = result.result;
                              if (data.success) {
                                 var items = data.items[0];
                                 w.editor.insertAtCursor('<img src="' + items.fileUrl + '"/>');
                              }
                              w.close();
                              w.destroy();
                           },
                           failure: function() {
                              w.close();
                              w.destroy();
                           }
                        });
                     }
                  }),
                  new Ext.Button({
                     text: 'Close',
                     handler: function(btn) {
                        var w = btn.ownerCt.ownerCt;
                        w.close();
                        w.destroy();
                     }
                  })
               ],

               items: new Ext.FormPanel({
                  id: 'insert-image-form',
                  border: false,
                  frame: true,
                  fileUpload: true,
                  autoHeight: true,
                  labelWidth: 50,
                  items: [new Ext.ux.form.FileUploadField({
                     id: 'form-file',
                     xtype: 'fileuploadfield',
                     anchor: '100%',
                     emptyText: 'Select an Image',
                     fieldLabel: 'Image',
                     name: 'image-path',
                     buttonText: '',
                     buttonCfg: {
                        iconCls: 'picture-add-ico'
                     }
                  })]
               })
            });
            win.show();
         },
         scope: this,
         tooltip: 'insert image',
         overflowText: 'insert image'
      }]);
   }
});

Ext.form.HtmlEditor.Preview = Ext.extend(Ext.util.Observable, {
   init: function(cmp) {
      this.cmp = cmp;
      this.cmp.on('render', this.onRender, this);
   },
   onRender: function() {
      this.cmp.getToolbar().addButton([{
         iconCls: 'x-edit-preview',
         handler: function(btn) {
            var win = new Ext.Window({
               id: 'preview-win',
               layout: 'fit',
               ctCls: 'body-panel',
               padding: 10,
               width: 700,
               height: 450,
               autoScroll: true,

               closeAction: 'hide',
               closable: false,
               resizable: false,
               modal: true,
               draggable: false,

               buttonAlign: 'center',
               buttons: [
                  new Ext.Button({
                     text: 'Close',
                     handler: function(btn) {
                        var w = btn.ownerCt.ownerCt;
                        w.close();
                        w.destroy();
                     }
                  })
               ],

               bodyStyle: 'background-color: #FFF; font-size: 12px;',
               html: this.cmp.getValue()
            });
            win.show();
         },
         scope: this,
         tooltip: 'preview',
         overflowText: 'preview'
      }]);
   }
});

Ext.override(Ext.form.HtmlEditor, {
   onEditorEvent: function() {
      if (Ext.isIE) {
         this.currentRange = this.getDoc().selection.createRange();
      }
      this.updateToolbar();
   },
   insertAtCursor: function(text) {
      if (Ext.isIE) {
         this.win.focus();
         var r = this.currentRange || this.doc.selection.createRange();
         if (r) {
            r.collapse(true);
            r.pasteHTML(text);
            this.syncValue();
            this.deferFocus();
         }

      } else if (Ext.isGecko || Ext.isOpera || Ext.isWebKit) {
         this.win.focus();
         this.execCmd('InsertHTML', text);
         this.deferFocus();
      } else if (Ext.isSafari) {
         this.execCmd('InsertText', text);
         this.deferFocus();
      }
   }
});

Ext.apply(Ext.form.DateField.prototype, {
   initComponent: function() {
      this.triggerConfig = {
         tag: 'span',
         cls: 'x-form-twin-triggers',
         cn: [{
               tag: "img",
               src: Ext.BLANK_IMAGE_URL,
               cls: "x-form-trigger x-form-clear-trigger"
            },
            {
               tag: "img",
               src: Ext.BLANK_IMAGE_URL,
               cls: "x-form-trigger x-form-date-trigger"
            }
         ]
      };
      Ext.form.DateField.superclass.initComponent.apply(this, arguments);
   },
   onTrigger1Click: function() {
      this.reset();
      this.fireEvent('select', this);
   },

   getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger,
   initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger,
   onTrigger2Click: Ext.form.DateField.prototype.onTriggerClick,
   trigger1Class: Ext.form.DateField.prototype.triggerClass,
   trigger2Class: Ext.form.DateField.prototype.triggerClass
});

//Ext.apply(Ext.form.ComboBox.prototype, {
//        initComponent: function() {
//                this.triggerConfig = {
//                        tag:'span', cls:'x-form-twin-triggers', cn:[
//                        {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-clear-trigger"},
//                        {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-arrow-trigger"}
//                ]};
//                Ext.form.ComboBox.superclass.initComponent.apply(this, arguments);
//        },
//        onTrigger1Click : function() {
//                this.reset();
//        },

//        getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger,
//        initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger,
//        onTrigger2Click: Ext.form.ComboBox.prototype.onTriggerClick,
//        trigger1Class: Ext.form.ComboBox.prototype.triggerClass,
//        trigger2Class: Ext.form.ComboBox.prototype.triggerClass
//});
// Namespace
Ext.ns('Senate', 'Senate.fm', 'Senate.fd', 'Senate.tf', 'Senate.cm', 'Senate.ffm', 'Senate.ev', 'Senate.gr');

// create reusable renderer
Ext.util.Format.comboRenderer = function(combo){
    return function(value){
        var record = combo.findRecord(combo.valueField, value);
        return record ? record.get(combo.displayField) : value;
    }
}

Ext.onReady(function(){	
	Ext.Ajax.request({
		url: 'json/Login.aspx',
		method: 'GET',
		success: function(result) {
			var json = Ext.util.JSON.decode(result.responseText);
			var data = json.data;
			if (data != null) {
				Senate.user = data;
			}
			new Senate.MainView();

			if (false) {
			    var ctype = null;
			    var now = new Date();
			    var month = now.getMonth();
			    var year = now.getYear();

			    var calendar = Ext.getCmp('body-panel').items.get(0).items.get(0);

			    calendar.setStartDate(new Date(year, month - 1, 1));

			    var ym = year + '';
			    if (month < 10) {
			        ym += '0' + month;
			    }
			    else {
			        ym += month;
			    }

			    var sql =
                    "select rownum as cid,calendar.* from ( " +
                    "select visit_name as title,sdate,edate,3 as ctype, 201022 as fmid, docid as subdocid,null as usid from tvisit_head where approved = 1 " +
                    "union " +
                    "select event_name as title,sdate,edate,2 as ctype, 201412 as fmid, docid as subdocid,null as usid from tevent_head where approved = 1 " +
                    "union " +
                    "SELECT CA.ANNUALNAME||' '|| CP.FULL_NAME_TH||' ('||CT.Full_Name_TH||')' AS title " +
                    "           , TO_DATE ( TO_CHAR ( CA.DDATE ) || '/' || TO_CHAR ( CA.MDATE ) || '/' || TO_CHAR ( " + year + " ), 'DD/MM/YYYY' ) As SDATE " +
                    "           , TO_DATE ( TO_CHAR ( CA.DDATE ) || '/' || TO_CHAR ( CA.MDATE ) || '/' || TO_CHAR ( " + year + " ), 'DD/MM/YYYY' ) AS EDATE " +
                    "           , 1 AS CTYPE, 201052 AS FMID, CP.CTID AS SUBDOCID ,S.USID " +
                    "FROM mContact_Annual CA " +
                    "INNER JOIN mCONTACT CP ON CA.CTID = CP.CTID " +
                    "Left Join mRelation Re on CP.CTID = RE.PERSONID " +
                    "Left Join mContact CT on RE.COMPID = CT.CTID " +
                    "Left Join mSale S on CT.SaleID = S.SaleiD " +
                    "WHERE (1 = 1) " +
                    "AND CP.BASETYPEID = 2 " +
                    "AND CA.AnnualTypeID = 2 " +
                    "AND NVL(CA.Calendar_Alert,0) = 1 " +
                    "AND      CA.DDATE is not null " +
                    "AND      CA.MDATE is not null " +
                    "AND s.USID is not null " +
                    ") calendar " +
                    "where sdate is not null and edate is not null and (99=99) ";

			    // ctype = 1 (birthday)
			    sql += "and " + ym + " between cast(to_char(sdate, 'yyyymm') as int) and cast(to_char(edate, 'yyyymm') as int)";
			    if (ctype) {
			        sql += " and ctype = " + ctype;
			        if (ctype == 1) {
			            sql += " and USID = " + Senate.user.userId;
			        }
			    }

			    show_loading();
			    Ext.Ajax.request({
			        url: Senate.url.Core,
			        method: 'POST',
			        params: { act: 'load_data', sql: sql, params: '' },
			        success: function (result, r) {
			            hide_loading();

			            var json = Ext.util.JSON.decode(result.responseText);
			            var evData = new Array();
			            var dt = json.data;
			            for (var i = 0; i < dt.length; i++) {
			                var rec = dt[i];
			                evData.push({
			                    id: rec.CID,
			                    title: rec.TITLE,
			                    start: Date.parseDate(rec.SDATE, 'd/m/Y H:i:s'),
			                    end: Date.parseDate(rec.EDATE, 'd/m/Y H:i:s'),
			                    cid: rec.CTYPE,
			                    ad: true,
			                    fmID: rec.FMID,
			                    docID: rec.SUBDOCID
			                });
			            }
			            calendar.eventStore.loadData({ data: evData });
			        }
			    });
			}
		}
	});

//    Ext.Ajax.request({
//		url: 'json/Test.aspx',
//		method: 'GET',
//		success: function(result) {
//			var json = Ext.util.JSON.decode(result.responseText);
//			var data = json.data;
//			alert(data[0][1]);
//		}
//	});
});

Senate.MainView = Ext.extend(Ext.Viewport, {
    id: 'main-view',
    layout: 'border',
    initComponent: function () {
        var main = this;

        if (Senate.user.userName == undefined) {
            this.bodyPanel = new Ext.Panel({
                region: 'center',
                layout: 'hbox',
                border: false,
                bodyStyle: 'padding-top: 50px; background-color: transparent',
                listeners: {
                    'afterlayout': function () {
                        Ext.getCmp('txt-userName').focus();
                    }
                },
                items: [{
                    flex: 1,
                    border: false
                }, new Ext.form.FormPanel({
                    id: 'login-form',
                    title: 'Login Form',
                    frame: true,
                    width: 350,
                    labelWidth: 120,
                    padding: 5,
                    items: [{
                        id: 'txt-userName',
                        xtype: 'textfield',
                        fieldLabel: 'Username',
                        name: 'uname',
                        anchor: '95%',
                        enableKeyEvents: true,
                        listeners: {
                            'keydown': function (txt, e) {
                                if (e.getKey() == 13) {
                                    var form = txt.ownerCt;
                                    form.login();
                                }
                            }
                        }
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Password',
                        name: 'pwd',
                        anchor: '95%',
                        inputType: 'password',
                        enableKeyEvents: true,
                        listeners: {
                            'keydown': function (txt, e) {
                                if (e.getKey() == 13) {
                                    var form = txt.ownerCt;
                                    form.login();
                                }
                            }
                        }
                    }, {
                        id: 'wsCmb',
                        xtype: 'hidden',
                        name: 'ws',
                        value: 1
                    }],

                    login: function () {
                        this.showLoading();
                        var f = this;

                        this.getForm().submit({
                            url: 'json/Login.aspx',
                            method: 'POST',
                            success: function (form, result) {
                                f.hideLoading();

                                if (result.result.data != null) {
                                    var user = result.result.data;
                                    Senate.user = user;
                                    main.destroy();
                                    new Senate.MainView();
                                }
                                else {
                                    Ext.Msg.show({
                                        title: 'Login Failed',
                                        msg: 'Invalid Username or Password',
                                        icon: Ext.Msg.ERROR,
                                        buttons: Ext.Msg.OK
                                    });
                                }
                            },
                            failure: function () {
                                f.hideLoading();
                            }
                        });
                    },

                    showLoading: function () {
                        this.mask = new Ext.LoadMask(document.getElementById('login-form'), { msg: "Loading..." });
                        this.mask.show();
                    },

                    hideLoading: function () {
                        this.mask.hide();
                    },

                    buttonAlign: 'center',
                    buttons: [new Ext.Button({
                        text: 'Login',
                        handler: function (btn) {
                            var form = btn.ownerCt.ownerCt;
                            form.login();
                        }
                    })]
                }), {
                    flex: 1,
                    border: false
                }]
            });

            this.items = [
	            new Ext.BoxComponent({
	                region: 'north',
	                autoEl: {
	                    id: 'header',
	                    tag: 'div',
	                    html: '<h1 id="sym-header">' + Senate.appName + '</h1>'
	                }
	            }),
	            new Ext.BoxComponent({
	                region: 'south',
	                autoEl: {
	                    id: 'footer',
	                    tag: 'div',
	                    html: 'Copyright 2011 Version ' + Senate.version
	                }
	            }), this.bodyPanel
	        ];

            Ext.getCmp('txt-userName').focus();
        }
        else {
            this.bodyPanel = new Senate.BodyPanel();
            this.menu = new Senate.MenuPanel();
            this.menu.loadMenu(this.bodyPanel);

            var user = Senate.user;
            var fullName = user.firstName + ' ' + user.surName;

            this.items = new Array();
            if (!getParameter('fmID')) {
                this.items.push(new Ext.BoxComponent({
                    region: 'north',
                    autoEl: {
                        id: 'header',
                        tag: 'div',
                        html:
							/*'<h2 id="sym-header">' + Senate.appName + '</h2>' +
	                    	'<ul>' +
	                    	'	<li>' + fullName + '</li>' +
	                    	'	<li>|</li>' +
	                    	'	<li><a id="unread-msg" style="display: none" href="javascript:openInbox();"></a></li>' +
	                    	'	<li id="unread-sep" style="display: none">|</li>' +
	                    	'	<li><a href="json/Login.aspx?act=logout">Log Out</a></li>' +
	                    	'</ul>' */
 '<table cellspacing="0" class=" x-toolbar-ct">' +
'	<tbody><tr>' +
'		<td id="sym-header" class="x-toolbar-cell x-toolbar-left" align="left">' +
'			<table cellspacing="0" class="x-btn x-btn-noicon" style="width: auto;">' +	 
'				<tbody class="x-btn x-btn-icon-left">' +
'					<tr><td class="x-btn"><h2  id="title"> &nbsp;&nbsp;</h2></td></tr>' +
'				</tbody>' +
 '			</table>' +
'		</td>' +
'		<td class="x-toolbar-right" align="right">' +
'			<table cellspacing="0" class="x-toolbar-right-ct">' +
'				<tbody><tr>' +
'					<td>' +
'						<table cellspacing="0">' +
'							<tbody><tr class="x-toolbar-right-row">' +
'								<td class="x-toolbar-cell">' +
'									<table cellspacing="0" class="x-btn x-btn-noicon" style="width: auto;">' +
'										<tbody class="x-btn x-btn-icon-left">' +
'											<tr><td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><div id="xxx"></div></td>' +
'                                               <td class="x-btn"><i>&nbsp;</i></td>' +
'                                               <td class= "x-btn" > <i>&nbsp;</i></td> ' +
'												<td class="x-btn">' + fullName + '</td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn">|</td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><a id="unread-msg" style="display: none" href="javascript:openInbox();"></a></td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><div id="unread-sep" style="display: none">|</div></td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><i>&nbsp;</i></td>' +
'												<td class="x-btn"><a href="json/Login.aspx?act=logout">Log Out</a></td>' +
'												<td class="x-btn-"><i>&nbsp;</i></td>' +
'											</tr></tbody>' +
'									</table></td>' +
'								</tr>' +
'							</tbody>' +
'						</table></td>' +
'					</tr></tbody></table>' +
'					</td></tr></tbody></table>'
                    }
                }));
                this.items.push(new Ext.BoxComponent({
                    region: 'south',
                    autoEl: {
                        id: 'footer',
                        tag: 'div',
                        html: 'Copyright 2011 Version ' + Senate.version
                    }
                }));
                this.items.push(this.menu);
            }
            this.items.push(this.bodyPanel);
		
            var delayInMilliseconds = 2000; //2 second
            setTimeout(function () {
                //your code to be executed after 1 second
                new Ext.form.ComboBox({
                    id: 'xxx2',
                    hiddenName: 'xxx2',
                    fieldLabel: 'Document Type',
                    anchor: '100%',

                    typeAhead: true,
                    triggerAction: 'all',
                    store: new Ext.data.ArrayStore({
                        fields: [
                            'itemId',
                            'itemName'
                        ],
                        data: [[0, 'All'], [1, 'Billing'], [2, 'ICT Billing']]
                    }),
                    mode: 'local',
                    valueField: 'itemId',
                    displayField: 'itemName',
                    //renderTo: Ext.getBody()
                    renderTo: Ext.get(document.getElementById('xxx')).dom
                });
            }, delayInMilliseconds);
        }

        Senate.MainView.superclass.initComponent.call(this);
    }
});

function openInbox() {
	Ext.Ajax.request({
		url: Senate.url.Core,
		method: 'POST',
		params: { act: 'count_unread' },
		success: function (result) {
			var json = Ext.util.JSON.decode(result.responseText);
			var count = json.data;

			var tmp = 'Inbox' + (count > 0 ? ' (' + count + ' Unread)' : '');
			var mainBody = Ext.getCmp('body-panel');
			
			mainBody.setPageTitle(tmp);
			mainBody.removeAll();
			mainBody.add(new Senate.PageTab({
				mmID: Senate.inbox,
				mainBody: mainBody
			}));
			mainBody.doLayout();
			
		}
	});
	
}
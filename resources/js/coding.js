Senate.LoadCalendar = function () {
    var calendar = get_field('myCalendar');
    var tbar = Ext.getCmp('body-panel').getTopToolbar();

    var today = new Date();
    set_value('month', today.getMonth() + 1);
    set_value('year', today.getFullYear());
    //get_field('myCalendar').setStartDate(new Date(get_value('year'), get_value('month'), 1));

    var loadEv = new Ext.Button({
        text: 'Load Event',
        handler: function () {
            var ctype = get_value('ctype');
            var month = get_value('month');
            var year = get_value('year');

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
    });
    var clearEv = new Ext.Button({
        text: 'Clear',
        handler: function () {
            set_value('ctype', null);
            set_value('month', today.getMonth() + 1);
            set_value('year', today.getFullYear());
            loadEv.handler();
        }
    });

    tbar.insert(tbar.items.length, loadEv);
    tbar.insert(tbar.items.length, clearEv);
    tbar.doLayout();
};
Senate.LoadCalendar();
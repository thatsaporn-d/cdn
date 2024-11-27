Senate.LoadCalendar = function () {
    var calendar = get_field('myCalendar');
    var tbar = Ext.getCmp('body-panel').getTopToolbar();

    var today = new Date();
    set_value('month', today.getMonth() + 1);
    set_value('year', today.getFullYear());

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
            show_loading();
            call_sp({
                spName: 'up_Calendar_List',
                map: true,
                params: [{
                    name: 'in_USID', type: 1, value: Senate.user.userId
                }, {
                    name: 'in_DocDate', type: 1, value: ym
                }, {
                    name: 'in_CType', type: 1, value: ((ctype)? ctype: null)
                }]
            }, function (data) {
                hide_loading();
                
                var evData = new Array();
                var dt = data.results;
                if (dt) {
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
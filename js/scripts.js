//document.addEventListener("deviceready", onDeviceReady, false);
//onDeviceReady();
/*


*/

// nastav true jsi-li na lokalu
var lokal = false;
var currentDate = new Date();
var pushNotification;
var token = "345";
var xmlFile; //stupneprovozu.xml
var registraceUkladani = false;  // indikuje proces pri prvni registraci registrovani

function onDeviceReady() {

    //$("#app-status-ul").append('<li>deviceready event received</li>');
    //localStorageNacti();
    uliceNactiAjax(localStorageNacti,ajaxError);
    //register(); // nefunguje bez opetovne registrace pri cold spusteni

    //token = "345";

    if(lokal)
    {
        $("#localStorageDelete").css("display","block");
    }

}


// nacte xml (do budoucna se xml bude moct updatovat)
// z xml vezme jen nazvy ulic a smery preskoci
function uliceNactiAjax(success_callback, error_callback)
{




    console.log("nacitam seznam ulic");
    infoZobraz("Načítám seznam ulic - strpení");
    $.ajax({
        type: "GET" ,
        url: "data/stupneprovozu2.xml" ,
        dataType: "xml" ,
        success: function(xml) {
            console.log("ajax succes");
            xmlFile = xml;
            var pocet = 0;
            var ulicePredchozi = "";

            $(xmlFile).find('title').each(function(){
                //var id = $(this).attr('id');
                //var title = $(this).find('title').text();
                var title = $(this).text();
                pocet ++;
                //$('#ulice').append('<option value="'+title+'">'+title+'</option>');
                var ulice = title.substring(0,title.indexOf(":"));
                if(ulice!=ulicePredchozi || ulicePredchozi=="")
                {
                    $('#ulice').append('<option value="'+ulice+'">'+ulice+'</option>');
                    ulicePredchozi = ulice;
                }
            });

            /*
            if(window.localStorage.getItem("ulice")!=null)
            {
                $( "#ulice").val(window.localStorage.getItem("ulice"));
                nactiSmer(window.localStorage.getItem("ulice"));
                if(window.localStorage.getItem("smer")!=null)
                {
                    $( "#smer").val(window.localStorage.getItem("smer"));
                    $( "#smer").selectmenu("refresh",true);
                }
            }
            $( "#ulice" ).selectmenu('refresh',true);
            infoZobraz("Připraveno")
            */
            $( "#ulice" ).selectmenu('refresh',true);
            infoZobraz("Seznam ulic načten");
            success_callback();
        },
        error: function(){
            infoZobraz("Nepodařily se načíst názvy ulic");
            error_callback();
        }

    });
}

function nactiSmer()
{
    var uliceHledana = $( "#ulice option:selected").text();
    $('#smer').empty();
    $(xmlFile).find('title').each(function(){
        var title = $(this).text();
        var ulice = title.substring(0,title.indexOf(":"));
        var smer = title.substring(title.indexOf(":")+2);
        if(ulice==uliceHledana)
        {
            $('#smer').append('<option value="'+smer+'">'+smer+'</option>');
        }
    });
    $( "#smer").selectmenu("refresh",true);
}

function localStorageNactiUliciAsmer()
{
    if(window.localStorage.getItem("ulice")!=null)
    {
        $( "#ulice").val(window.localStorage.getItem("ulice"));
        //$( "#ulice").selectmenu("refresh",true);
    }
    $( "#ulice" ).selectmenu('refresh',true);
}

function localStorageNacti()
{
    // ulice a smer se nacita zvlast po nacteni ulic do listu a jeho refresh
    if(window.localStorage.getItem("ulice")!=null)
    {
        $( "#ulice").val(window.localStorage.getItem("ulice"));
        $( "#ulice" ).selectmenu('refresh',true);
    }
    nactiSmer();
    if(window.localStorage.getItem("smer")!=null)
    {
        $( "#smer").val(window.localStorage.getItem("smer"));
        $( "#smer").selectmenu("refresh",true);
    }
    if(window.localStorage.getItem("token")!=null)
    {
        token = window.localStorage.getItem("token");
    }
    if(window.localStorage.getItem("casOd")!=null)
    {
        var casOd= window.localStorage.getItem("casOd")
        $( "#casOd").val(casOd);
        $( "#casOd").selectmenu("refresh",true);
    }
    if(window.localStorage.getItem("casDo")!=null)
    {
        $( "#casDo").val(window.localStorage.getItem("casDo"));
        $( "#casDo").selectmenu("refresh",true);
    }
    if(window.localStorage.getItem("stav")!=null)
    {
        $( "#stav").val(window.localStorage.getItem("stav"));
        $( "#stav").selectmenu("refresh",true);
    }

    if(window.localStorage.getItem("zapVyp")!=null)
    {
        var zapVyp = window.localStorage.getItem("zapVyp");
        if(zapVyp=="y")
        {
            //alert(window.localStorage.getItem("vypDnes"));
            //$( "#checkBoxVypZap").prop('checked', true).checkboxradio("refresh");
            $( "#checkBoxVypZap").attr('checked', true).checkboxradio("refresh");
            checkBoxVypDnesChange();
            if(window.localStorage.getItem("vypDnes")!=null)
            {
                var vypDnes = window.localStorage.getItem("vypDnes");
                currentDateString = currentDate.getFullYear()+"-"+currentDate.getMonth()+"-"+currentDate.getDate()
                if(currentDateString==vypDnes)
                {
                    $( "#checkBoxVypDnes").attr('checked', true).checkboxradio("refresh");
                }

            }
        }

    }

    // TODO dalsi nastaveni
    if(token=="")
    {
        registraceUkladani = true;
        register();
    }
}



function localStorageDelete()
{
    window.localStorage.clear();
    token ="";
    alert("deleted");
}

function infoZobraz(msg)
{
    var d = new Date();
    //msg = d.getUTCHours() + ":" + d.getMinutes() + ":" + d.getUTCSeconds() + "-" + msg;
    msg = $("#info").html() + "<br>" + msg;
    $("#info").html(msg);
    $("#infoContainer").scrollTop( $("#info").height() );
}

function registerFake()
{
    // odregistrace
    if(token!="")
    {
        serverSend("odregistrace",odregistraceOK);
        return;
    }

    //registrace

    // vola registraci GCM
    infoZobraz("Volám registraci GCM");
    // prijata registrace

    // zobrazi hlasku a cislo
    infoZobraz("Zaregistrováno v GCM");
    token = "123";
    // ulozi na server
    serverSend("registrace",registraceOK);
    // ulozi do persistance
    infoZobraz("Uloženo na serveru");
    window.localStorage.setItem("token",token);
    // TODO ulozit ulice a cisla do persistance
    $("#registraceButton").val("Odregistrovat od přijímání zpráv");


}

function registraceRun()
{
    // odregistrace
    if(token!="")
    {
        serverSend("odregistrace",odregistraceOK);
        return;
    }

    register();
}

function nastaveniZmena()
{
    serverSend(nastaveniZmenaOk,ajaxError);
}

function zkusebniPozadavekOdeslat()
{
    if(window.localStorage.getItem("zkusebniPozadavek")!=null)
    {
        zkusebniPozadavek = window.localStorage.getItem("zkusebniPozadavek");
        zkusebniPozadavek ++;
    }
    else
    {
        zkusebniPozadavek = 1;
    }
    window.localStorage.setItem("zkusebniPozadavek",zkusebniPozadavek);
    var text = Math.floor((Math.random()*100)+1) + "-" + zkusebniPozadavek;
    infoZobraz("Odesílám zkušební notifikaci: " + text);
    serverSend(zkusebniPozadavekOk,ajaxError,text);
}

function zkusebniPozadavekOk()
{
    infoZobraz("Zkušební požadavek odeslán");
}

function stavTed()
{
    console.log("stavTed");
    infoZobraz("Zjišťuji stav");
    var ulice = $( "#ulice option:selected").text() + ": " + $( "#smer option:selected").text();
    console.log("zjistuji stav ulice: " + ulice);
    console.log("ulice:"+ulice);
    $.ajax({
        type: 'POST',
        url: 'http://demo.livecycle.cz/lc/content/zacpa.test2',
        data : {
            ulice: ulice,
            zjistiStav: "true",
            _charset_: "utf-8"
        },
        success: function(data) {
            console.log("serverSend success");
            console.log(data);
            infoZobraz(data);
        },
        error: function(data) {
            console.log("serverSend error");
            ajaxError("serverSend","",data);
        }
    });
}

function serverSend(success_callback, error_callback, zkusebniPozadavek)
{
    if(!registraceUkladani && zkusebniPozadavek==null)
    {
        infoZobraz("Ukládám nastavení");
    }
    console.log("serverSend");
    console.log("zkusebni pozadavek =" + zkusebniPozadavek);


    // jestli neexistuje token, zaregistrovat
    // muze se tak stat, ze nevysla registrace pri spusteni pristroje, nebo je problem
    if(token=="")
    {
        console.log("neni token, registruji");
        register();
        return;
    }
    console.log("token:"+token);


    // TODO odregistraci

    //console.log("zapVyp:"+zapVyp);
    var stav = $( "#stav").val();
    console.log("stav:"+stav);
    var ulice = $( "#ulice option:selected").text() + ": " + $( "#smer option:selected").text();
    console.log("ulice:"+ulice);
    $.ajax({
        type: zkusebniPozadavek==null?'POST':'GET',
        // pokud je POST, na CRX se nepusti test.jsp ale POST.jsp !!
        // post je na ulozeni
        // get na odeslani z
        url: 'http://demo.livecycle.cz/lc/content/zacpa.test',
        data : {
            zapVyp: $( "#checkBoxVypZap" ).is(':checked'),
            token: token,
            stav: stav,
            ulice: ulice,
            casOd : $( "#casOd").val(),
            casDo : $( "#casDo").val(),
            vypDnes: $( "#checkBoxVypDnes" ).is(':checked'),
            zkusebniPozadavek: zkusebniPozadavek,
            verzeApp: $( "#verzeApp").val(),
            _charset_: "utf-8"
},
        success: function(data) {
            console.log("serverSend success");
            var messageBack = String(data).split("++");
            if(messageBack[1]!=null) infoZobraz(messageBack[1]);
            success_callback();
        },
        error: function(data) {
            console.log("serverSend error");
            ajaxError("serverSend","",data);
        }
    });


}

function ajaxError(source,msg,data)
{
    alert("Nelze se připojit k serveru: " + source + msg);
}

function registraceOK()
{
    infoZobraz("Zaregistrováno");
    window.localStorage.setItem("token",token);
    // TODO ulozit ulice a cisla do persistance
    $("#registraceButton").val("Odregistrovat od přijímání zpráv");
}
function odregistraceOK()
{
    // smazat celou persistanci? asi ne
    window.localStorage.removeItem("token");
    token ="";
    infoZobraz("Odregistrováno");
    $("#registraceButton").val("Zaregistrovat k přijímání zpráv");
}
function nastaveniZmenaOk()
{
    // TODO aby se ukladal token jen pri registraci
    window.localStorage.setItem("token",token);
    window.localStorage.setItem("vypDnes",$( "#checkBoxVypDnes" ).is(':checked')?(currentDate.getFullYear()+"-"+currentDate.getMonth()+"-"+currentDate.getDate()):"n");
    window.localStorage.setItem("zapVyp",$( "#checkBoxVypZap" ).is(':checked')?"y":"n");
    window.localStorage.setItem("ulice",$( "#ulice").val());
    window.localStorage.setItem("smer",$( "#smer").val());
    window.localStorage.setItem("stav",$( "#stav").val());
    window.localStorage.setItem("casOd",$( "#casOd").val());
    window.localStorage.setItem("casDo",$( "#casDo").val());
    if(!registraceUkladani)
    {
        infoZobraz("Nastavení uloženo");
    }
    else
    {
        registraceUkladani = false;
    }

}


function register() {
    console.log("Register");
    /*
    document.addEventListener("backbutton", function(e)
    {
        $("#app-status-ul").append('<li>backbutton event received</li>');

        if( $("#home").length > 0)
        {
            // call this to get a new token each time. don't call it to reuse existing token.
            //pushNotification.unregister(successHandler, errorHandler);
            e.preventDefault();
            navigator.app.exitApp();
        }
        else
        {
            navigator.app.backHistory();
        }
    }, false);
*/
    //infoZobraz("Registrace GCM");
    if(lokal)
    {
        //token = "345";
        //infoZobraz("Ukládání nastavení na server");
        serverSend(nastaveniZmenaOk,ajaxError);
        return;
    }

    try
    {
        pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android') {
            //$("#app-status-ul").append('<li>registering android</li>');
            pushNotification.register(successHandler, errorHandler, {"senderID":"131911362908","ecb":"onNotificationGCM"});		// required!
        } else {
            //$("#app-status-ul").append('<li>registering iOS</li>');
            pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
        }
    }
    catch(err)
    {
        txt="There was an error on this page.\n\n";
        txt+="Error description: " + err.message + "\n\n";
        alert(txt);
    }
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
        //$("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
        navigator.notification.alert(e.alert);
    }

    if (e.sound) {
        var snd = new Media(e.sound);
        snd.play();
    }

    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}

// handle GCM notifications for Android
function onNotificationGCM(e) {
    //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                //$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                console.log("regID = " + e.regid);

                // pristroj nenbyl jeste zaregistrovan
                if(token=="")
                {
                    token = e.regid;
                    //infoZobraz("Ukládání nastavení na server");
                    serverSend(nastaveniZmenaOk,ajaxError);

                }
                token = e.regid;
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                //alert("aa");
                console.log("foreground");
                //infoZobraz(e.payload.title);
                //infoZobraz(e.payload.message);
                //infoZobraz(e.payload.msgcnt);
                // if the notification contains a soundname, play it.
                //var my_media = new Media("/android_asset/www/"+e.soundname);
                //my_media.play();
            }
            else
            {	// otherwise we were launched because the user touched a notification in the notification tray.
                /*
                if (e.coldstart)
                    $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                else
                    $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                */
                //alert("bb");
                console.log("foreground");

            }
            infoZobraz(e.payload.message);
            infoZobraz(e.payload.title);
            //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            //infoZobraz(e.payload.message+ "<br>" +e.payload.msgcnt);

            break;

        case 'error':
            //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
            infoZobraz("ERROR -> MSG:" + e.msg );
            break;

        default:
            //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            infoZobraz("Neznámám chyba");
            break;
    }
}

// tohle je asi pri registraci iOS
function tokenHandler (result) {
    //$("#app-status-ul").append('<li>token: '+ result +'</li>');
    // pristroj nenbyl jeste zaregistrovan
    if(token=="")
    {
        token = result;
        //infoZobraz("Ukládání nastavení na server");
        serverSend(nastaveniZmenaOk,ajaxError);

    }
    token = result;
    //infoZobraz("token" + result);
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}

function successHandler (result) {
    //$("#app-status-ul").append('<li>success:'+ result +'</li>');
    //infoZobraz("success"+ result);
}

function errorHandler (error) {
    //$("#app-status-ul").append('<li>error:'+ error +'</li>');
    infoZobraz("error" + error);
}

function checkBoxVypDnesChange()
{
    if($( "#checkBoxVypZap" ).is(':checked')==true)
    {
        $( "#checkBoxVypDnes").css('display', 'block');
        $( "#lableBoxVypDnes").css('display', 'block');
    } else
    {
        $( "#checkBoxVypDnes").css('display', 'none');
        $( "#lableBoxVypDnes").css('display', 'none');
    }
}

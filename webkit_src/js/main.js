$(document).ready(function() {
	if(localStorage.islogin == "true") {		
		document.addEventListener("deviceready", function(){
    		setTimeout(function() {
				$.mobile.changePage("#jadwal-page", {transition: "slidedown", changeHash: false});
				cordova.exec(function(done) {}, function(err){}
				, "LoginBimay", "toast", ["So glad to see you again " + localStorage.fname]);
			}, 2000);
			onLogedin();
			render();
		});
	} else {
		setTimeout(function() {
			$.mobile.changePage("#login-page", {transition: "slidedown", changeHash: false});
		}, 2000);
	}
});



$("#form-login").on('submit', function(e) {
	e.preventDefault();

	if(!($("#fr-binusian").val() && $("#fr-password").val())) { 
		alert("Please Fill Binusian id and password");
		return false;
	}

	if(typeof cordova !== 'undefined') {
		cordova.exec(function(done) {
			localStorage.loginId = JSON.stringify({
				binusid: $("#fr-binusian").val()
			,	password: $("#fr-password").val()
			});
			localStorage.islogin = true;
			localStorage.fname = done;
			onLogedin();
			render();
			$.mobile.changePage("#jadwal-page", {transition: "slidedown", changeHash: false});
		}, function(err) {
			
		}, "LoginBimay", "login", [$("#fr-binusian").val(),$("#fr-password").val()]);
	} else {
		//console.log("login test : " + $("#fr-binusian").val() + " " + $("#fr-password").val());
	}
});

function cekJadwal()
{
	cordova.exec(function(done) {

		//Fetch data and concat
		var _schedule = $(done).find("table")
		,	today 	  = jadwaltoJSON(_schedule.eq(0).html())
		,	next  	  = jadwaltoJSON(_schedule.eq(1).html())
		,	skedul 	  = today.concat(next);

		localStorage.jadwal = JSON.stringify(skedul);
		
		render();
		localStorage.lastUpdate = moment().format('D MMMM YYYY h:mm:ss');
		onCekjadwal();
		onLogedin();
		render();
	}, function(err) {
	}, "LoginBimay", "cekJadwal", []);
}

function onCekjadwal() {
	$(".loading-bar").hide();
	$("#cek-jadwal").on('click', function(e) {
		e.preventDefault();
		$(".loading-bar").show();
		$(this).off();
		if(typeof cordova !== 'undefined') {
			var account = JSON.parse(localStorage.loginId);
			cordova.exec(function(done) {
				if(done == 1) {
					cekJadwal();
				} else {
					//Login lagi
					cordova.exec(function(done) {
						cekJadwal(); //kemudian cek jadwal
					}, function(err) {
						alert("Cannot reach server for this time !");
						onCekjadwal();
					}, "LoginBimay", "loginAgain", [account.binusid, account.password]);
				}
			}, function(err) {
				alert("Cannot reach server for this time !");
				onCekjadwal();
			}, "LoginBimay", "cekLogin", []);
		}
	});
}
onCekjadwal();

function onLogedin()
{
	$("#fn").text(localStorage.fname);
	if(localStorage.lastUpdate) {
		$("#lastup").html("Last update &mdash; " + localStorage.lastUpdate);
	} else {
		$("#lastup").html("Welcome");
	}
}

function jadwaltoJSON(data)
{
	var hasil = [];
	$(data).find('tr').each(function(i, a) {
		var ht = $(this).find('td');
		if(i > 0) {
			hasil.push({
					date: ht.eq(0).html()
				,	time: ht.eq(1).html()
				,	state: ht.eq(2).html()
				,	course: ht.eq(3).html()
				,	clas: ht.eq(5).html()
				,	room: ht.eq(6).html()
				,	building: ht.eq(7).html()
			});
		}
	});
	return hasil;
}

function render()
{
	var elm  = $("#list-jadwal")
	,	data = (localStorage.jadwal ? JSON.parse(localStorage.jadwal) : []);
	elm.empty();	
	if(data.length) {

		var group_data = _.groupBy(data, function(o) { return o.date; });

		$.each(group_data, function(i, d) {

			elm.append('<li data-role="list-divider" class="ui-li-divider ui-bar-inherit ui-first-child">' + i + '</li>');

			if(moment(i).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY')) {
				elm.find("li:last-child").css({
					'background': '#F0B600'
				,	'color': '#FFF'
				,	'border-color': '#C09818'
				,	'text-shadow': 'none'
				});
			}

			$.each(group_data[i], function(j, e) {
				// 	elm.append(
				// 	'<li>'
				// +       '<time>' +e.date+ '  ' +e.time+ '</time>'
				// +       '<span>' +e.course+ '</span>'
				// +       '<div class="footer">'
				// +           '<span>' +e.state+ '</span> &mdash;'
				// +           '<span>' +e.room+ '</span> &mdash;'
				// +           '<span>' +e.building+ '</span>'
				// +       '</div>'
				// +   '</li>'
				elm.append(
					'<li class="ui-li-static ui-body-inherit">'
				+		'<h2>' +e.course+ '</h2>'
				+		'<p>' +e.state+ ' &mdash; Room ' +e.room+ ' &mdash; Buidling ' +e.building+ '</p>'
				+		'<p class="ui-li-aside"><strong>' +e.time+ '</strong></p>'
				+	'</li>'
					);
			});
		});
	} else {
		elm.append('<li class="ui-li-static ui-body-inherit"><p class="not_found"><i class="fa fa-frown-o"></i><span>No schedule found</span></p>');
	}
}

$("#main-menu ul li a").on('click', function(e) {
	e.preventDefault();
	$("#main-menu").panel("close");
	var action = $(this).data("action");
	switch(action) {
		case 'about':
			$.mobile.changePage("#about-page", {transition: "slidedown", changeHash: false});
			break;
		case 'logout':
			$.mobile.changePage("#login-page", {transition: "slidedown", changeHash: false});
			localStorage.removeItem("islogin");
			localStorage.removeItem("loginId");
			localStorage.removeItem("jadwal");
			localStorage.removeItem("lastUpdate");
			break;
	}
});

$(".h-back-btn").on('click', function(e) {
	e.preventDefault();
	$.mobile.changePage("#jadwal-page", {transition: "slidedown", changeHash: false});
});

// $(document).on("backbutton", function(e) {
// 	e.preventDefault();
// });

// _.groupBy(JSON.parse(s).bimay_schedule, function(o) { return o.date; });


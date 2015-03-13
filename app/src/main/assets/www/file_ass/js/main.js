(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3ZWJraXRfc3JjL2pzL21haW4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGlmKGxvY2FsU3RvcmFnZS5pc2xvZ2luID09IFwidHJ1ZVwiKSB7XHRcdFxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2VyZWFkeVwiLCBmdW5jdGlvbigpe1xuICAgIFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkLm1vYmlsZS5jaGFuZ2VQYWdlKFwiI2phZHdhbC1wYWdlXCIsIHt0cmFuc2l0aW9uOiBcInNsaWRlZG93blwiLCBjaGFuZ2VIYXNoOiBmYWxzZX0pO1xuXHRcdFx0XHRjb3Jkb3ZhLmV4ZWMoZnVuY3Rpb24oZG9uZSkge30sIGZ1bmN0aW9uKGVycil7fVxuXHRcdFx0XHQsIFwiTG9naW5CaW1heVwiLCBcInRvYXN0XCIsIFtcIlNvIGdsYWQgdG8gc2VlIHlvdSBhZ2FpbiBcIiArIGxvY2FsU3RvcmFnZS5mbmFtZV0pO1xuXHRcdFx0fSwgMjAwMCk7XG5cdFx0XHRvbkxvZ2VkaW4oKTtcblx0XHRcdHJlbmRlcigpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHQkLm1vYmlsZS5jaGFuZ2VQYWdlKFwiI2xvZ2luLXBhZ2VcIiwge3RyYW5zaXRpb246IFwic2xpZGVkb3duXCIsIGNoYW5nZUhhc2g6IGZhbHNlfSk7XG5cdFx0fSwgMjAwMCk7XG5cdH1cbn0pO1xuXG5cblxuJChcIiNmb3JtLWxvZ2luXCIpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRpZighKCQoXCIjZnItYmludXNpYW5cIikudmFsKCkgJiYgJChcIiNmci1wYXNzd29yZFwiKS52YWwoKSkpIHsgXG5cdFx0YWxlcnQoXCJQbGVhc2UgRmlsbCBCaW51c2lhbiBpZCBhbmQgcGFzc3dvcmRcIik7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aWYodHlwZW9mIGNvcmRvdmEgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0Y29yZG92YS5leGVjKGZ1bmN0aW9uKGRvbmUpIHtcblx0XHRcdGxvY2FsU3RvcmFnZS5sb2dpbklkID0gSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRiaW51c2lkOiAkKFwiI2ZyLWJpbnVzaWFuXCIpLnZhbCgpXG5cdFx0XHQsXHRwYXNzd29yZDogJChcIiNmci1wYXNzd29yZFwiKS52YWwoKVxuXHRcdFx0fSk7XG5cdFx0XHRsb2NhbFN0b3JhZ2UuaXNsb2dpbiA9IHRydWU7XG5cdFx0XHRsb2NhbFN0b3JhZ2UuZm5hbWUgPSBkb25lO1xuXHRcdFx0b25Mb2dlZGluKCk7XG5cdFx0XHRyZW5kZXIoKTtcblx0XHRcdCQubW9iaWxlLmNoYW5nZVBhZ2UoXCIjamFkd2FsLXBhZ2VcIiwge3RyYW5zaXRpb246IFwic2xpZGVkb3duXCIsIGNoYW5nZUhhc2g6IGZhbHNlfSk7XG5cdFx0fSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcblx0XHR9LCBcIkxvZ2luQmltYXlcIiwgXCJsb2dpblwiLCBbJChcIiNmci1iaW51c2lhblwiKS52YWwoKSwkKFwiI2ZyLXBhc3N3b3JkXCIpLnZhbCgpXSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly9jb25zb2xlLmxvZyhcImxvZ2luIHRlc3QgOiBcIiArICQoXCIjZnItYmludXNpYW5cIikudmFsKCkgKyBcIiBcIiArICQoXCIjZnItcGFzc3dvcmRcIikudmFsKCkpO1xuXHR9XG59KTtcblxuZnVuY3Rpb24gY2VrSmFkd2FsKClcbntcblx0Y29yZG92YS5leGVjKGZ1bmN0aW9uKGRvbmUpIHtcblxuXHRcdC8vRmV0Y2ggZGF0YSBhbmQgY29uY2F0XG5cdFx0dmFyIF9zY2hlZHVsZSA9ICQoZG9uZSkuZmluZChcInRhYmxlXCIpXG5cdFx0LFx0dG9kYXkgXHQgID0gamFkd2FsdG9KU09OKF9zY2hlZHVsZS5lcSgwKS5odG1sKCkpXG5cdFx0LFx0bmV4dCAgXHQgID0gamFkd2FsdG9KU09OKF9zY2hlZHVsZS5lcSgxKS5odG1sKCkpXG5cdFx0LFx0c2tlZHVsIFx0ICA9IHRvZGF5LmNvbmNhdChuZXh0KTtcblxuXHRcdGxvY2FsU3RvcmFnZS5qYWR3YWwgPSBKU09OLnN0cmluZ2lmeShza2VkdWwpO1xuXHRcdFxuXHRcdHJlbmRlcigpO1xuXHRcdGxvY2FsU3RvcmFnZS5sYXN0VXBkYXRlID0gbW9tZW50KCkuZm9ybWF0KCdEIE1NTU0gWVlZWSBoOm1tOnNzJyk7XG5cdFx0b25DZWtqYWR3YWwoKTtcblx0XHRvbkxvZ2VkaW4oKTtcblx0XHRyZW5kZXIoKTtcblx0fSwgZnVuY3Rpb24oZXJyKSB7XG5cdH0sIFwiTG9naW5CaW1heVwiLCBcImNla0phZHdhbFwiLCBbXSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2VramFkd2FsKCkge1xuXHQkKFwiLmxvYWRpbmctYmFyXCIpLmhpZGUoKTtcblx0JChcIiNjZWstamFkd2FsXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0JChcIi5sb2FkaW5nLWJhclwiKS5zaG93KCk7XG5cdFx0JCh0aGlzKS5vZmYoKTtcblx0XHRpZih0eXBlb2YgY29yZG92YSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHZhciBhY2NvdW50ID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UubG9naW5JZCk7XG5cdFx0XHRjb3Jkb3ZhLmV4ZWMoZnVuY3Rpb24oZG9uZSkge1xuXHRcdFx0XHRpZihkb25lID09IDEpIHtcblx0XHRcdFx0XHRjZWtKYWR3YWwoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL0xvZ2luIGxhZ2lcblx0XHRcdFx0XHRjb3Jkb3ZhLmV4ZWMoZnVuY3Rpb24oZG9uZSkge1xuXHRcdFx0XHRcdFx0Y2VrSmFkd2FsKCk7IC8va2VtdWRpYW4gY2VrIGphZHdhbFxuXHRcdFx0XHRcdH0sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRcdFx0YWxlcnQoXCJDYW5ub3QgcmVhY2ggc2VydmVyIGZvciB0aGlzIHRpbWUgIVwiKTtcblx0XHRcdFx0XHRcdG9uQ2VramFkd2FsKCk7XG5cdFx0XHRcdFx0fSwgXCJMb2dpbkJpbWF5XCIsIFwibG9naW5BZ2FpblwiLCBbYWNjb3VudC5iaW51c2lkLCBhY2NvdW50LnBhc3N3b3JkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRhbGVydChcIkNhbm5vdCByZWFjaCBzZXJ2ZXIgZm9yIHRoaXMgdGltZSAhXCIpO1xuXHRcdFx0XHRvbkNla2phZHdhbCgpO1xuXHRcdFx0fSwgXCJMb2dpbkJpbWF5XCIsIFwiY2VrTG9naW5cIiwgW10pO1xuXHRcdH1cblx0fSk7XG59XG5vbkNla2phZHdhbCgpO1xuXG5mdW5jdGlvbiBvbkxvZ2VkaW4oKVxue1xuXHQkKFwiI2ZuXCIpLnRleHQobG9jYWxTdG9yYWdlLmZuYW1lKTtcblx0aWYobG9jYWxTdG9yYWdlLmxhc3RVcGRhdGUpIHtcblx0XHQkKFwiI2xhc3R1cFwiKS5odG1sKFwiTGFzdCB1cGRhdGUgJm1kYXNoOyBcIiArIGxvY2FsU3RvcmFnZS5sYXN0VXBkYXRlKTtcblx0fSBlbHNlIHtcblx0XHQkKFwiI2xhc3R1cFwiKS5odG1sKFwiV2VsY29tZVwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiBqYWR3YWx0b0pTT04oZGF0YSlcbntcblx0dmFyIGhhc2lsID0gW107XG5cdCQoZGF0YSkuZmluZCgndHInKS5lYWNoKGZ1bmN0aW9uKGksIGEpIHtcblx0XHR2YXIgaHQgPSAkKHRoaXMpLmZpbmQoJ3RkJyk7XG5cdFx0aWYoaSA+IDApIHtcblx0XHRcdGhhc2lsLnB1c2goe1xuXHRcdFx0XHRcdGRhdGU6IGh0LmVxKDApLmh0bWwoKVxuXHRcdFx0XHQsXHR0aW1lOiBodC5lcSgxKS5odG1sKClcblx0XHRcdFx0LFx0c3RhdGU6IGh0LmVxKDIpLmh0bWwoKVxuXHRcdFx0XHQsXHRjb3Vyc2U6IGh0LmVxKDMpLmh0bWwoKVxuXHRcdFx0XHQsXHRjbGFzOiBodC5lcSg1KS5odG1sKClcblx0XHRcdFx0LFx0cm9vbTogaHQuZXEoNikuaHRtbCgpXG5cdFx0XHRcdCxcdGJ1aWxkaW5nOiBodC5lcSg3KS5odG1sKClcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBoYXNpbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKClcbntcblx0dmFyIGVsbSAgPSAkKFwiI2xpc3QtamFkd2FsXCIpXG5cdCxcdGRhdGEgPSAobG9jYWxTdG9yYWdlLmphZHdhbCA/IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmphZHdhbCkgOiBbXSk7XG5cdGVsbS5lbXB0eSgpO1x0XG5cdGlmKGRhdGEubGVuZ3RoKSB7XG5cblx0XHR2YXIgZ3JvdXBfZGF0YSA9IF8uZ3JvdXBCeShkYXRhLCBmdW5jdGlvbihvKSB7IHJldHVybiBvLmRhdGU7IH0pO1xuXG5cdFx0JC5lYWNoKGdyb3VwX2RhdGEsIGZ1bmN0aW9uKGksIGQpIHtcblxuXHRcdFx0ZWxtLmFwcGVuZCgnPGxpIGRhdGEtcm9sZT1cImxpc3QtZGl2aWRlclwiIGNsYXNzPVwidWktbGktZGl2aWRlciB1aS1iYXItaW5oZXJpdCB1aS1maXJzdC1jaGlsZFwiPicgKyBpICsgJzwvbGk+Jyk7XG5cblx0XHRcdGlmKG1vbWVudChpKS5mb3JtYXQoJ0RELU1NLVlZWVknKSA9PSBtb21lbnQoKS5mb3JtYXQoJ0RELU1NLVlZWVknKSkge1xuXHRcdFx0XHRlbG0uZmluZChcImxpOmxhc3QtY2hpbGRcIikuY3NzKHtcblx0XHRcdFx0XHQnYmFja2dyb3VuZCc6ICcjRjBCNjAwJ1xuXHRcdFx0XHQsXHQnY29sb3InOiAnI0ZGRidcblx0XHRcdFx0LFx0J2JvcmRlci1jb2xvcic6ICcjQzA5ODE4J1xuXHRcdFx0XHQsXHQndGV4dC1zaGFkb3cnOiAnbm9uZSdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdCQuZWFjaChncm91cF9kYXRhW2ldLCBmdW5jdGlvbihqLCBlKSB7XG5cdFx0XHRcdC8vIFx0ZWxtLmFwcGVuZChcblx0XHRcdFx0Ly8gXHQnPGxpPidcblx0XHRcdFx0Ly8gKyAgICAgICAnPHRpbWU+JyArZS5kYXRlKyAnICAnICtlLnRpbWUrICc8L3RpbWU+J1xuXHRcdFx0XHQvLyArICAgICAgICc8c3Bhbj4nICtlLmNvdXJzZSsgJzwvc3Bhbj4nXG5cdFx0XHRcdC8vICsgICAgICAgJzxkaXYgY2xhc3M9XCJmb290ZXJcIj4nXG5cdFx0XHRcdC8vICsgICAgICAgICAgICc8c3Bhbj4nICtlLnN0YXRlKyAnPC9zcGFuPiAmbWRhc2g7J1xuXHRcdFx0XHQvLyArICAgICAgICAgICAnPHNwYW4+JyArZS5yb29tKyAnPC9zcGFuPiAmbWRhc2g7J1xuXHRcdFx0XHQvLyArICAgICAgICAgICAnPHNwYW4+JyArZS5idWlsZGluZysgJzwvc3Bhbj4nXG5cdFx0XHRcdC8vICsgICAgICAgJzwvZGl2Pidcblx0XHRcdFx0Ly8gKyAgICc8L2xpPidcblx0XHRcdFx0ZWxtLmFwcGVuZChcblx0XHRcdFx0XHQnPGxpIGNsYXNzPVwidWktbGktc3RhdGljIHVpLWJvZHktaW5oZXJpdFwiPidcblx0XHRcdFx0K1x0XHQnPGgyPicgK2UuY291cnNlKyAnPC9oMj4nXG5cdFx0XHRcdCtcdFx0JzxwPicgK2Uuc3RhdGUrICcgJm1kYXNoOyBSb29tICcgK2Uucm9vbSsgJyAmbWRhc2g7IEJ1aWRsaW5nICcgK2UuYnVpbGRpbmcrICc8L3A+J1xuXHRcdFx0XHQrXHRcdCc8cCBjbGFzcz1cInVpLWxpLWFzaWRlXCI+PHN0cm9uZz4nICtlLnRpbWUrICc8L3N0cm9uZz48L3A+J1xuXHRcdFx0XHQrXHQnPC9saT4nXG5cdFx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGVsbS5hcHBlbmQoJzxsaSBjbGFzcz1cInVpLWxpLXN0YXRpYyB1aS1ib2R5LWluaGVyaXRcIj48cCBjbGFzcz1cIm5vdF9mb3VuZFwiPjxpIGNsYXNzPVwiZmEgZmEtZnJvd24tb1wiPjwvaT48c3Bhbj5ObyBzY2hlZHVsZSBmb3VuZDwvc3Bhbj48L3A+Jyk7XG5cdH1cbn1cblxuJChcIiNtYWluLW1lbnUgdWwgbGkgYVwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0JChcIiNtYWluLW1lbnVcIikucGFuZWwoXCJjbG9zZVwiKTtcblx0dmFyIGFjdGlvbiA9ICQodGhpcykuZGF0YShcImFjdGlvblwiKTtcblx0c3dpdGNoKGFjdGlvbikge1xuXHRcdGNhc2UgJ2Fib3V0Jzpcblx0XHRcdCQubW9iaWxlLmNoYW5nZVBhZ2UoXCIjYWJvdXQtcGFnZVwiLCB7dHJhbnNpdGlvbjogXCJzbGlkZWRvd25cIiwgY2hhbmdlSGFzaDogZmFsc2V9KTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2xvZ291dCc6XG5cdFx0XHQkLm1vYmlsZS5jaGFuZ2VQYWdlKFwiI2xvZ2luLXBhZ2VcIiwge3RyYW5zaXRpb246IFwic2xpZGVkb3duXCIsIGNoYW5nZUhhc2g6IGZhbHNlfSk7XG5cdFx0XHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImlzbG9naW5cIik7XG5cdFx0XHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImxvZ2luSWRcIik7XG5cdFx0XHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImphZHdhbFwiKTtcblx0XHRcdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibGFzdFVwZGF0ZVwiKTtcblx0XHRcdGJyZWFrO1xuXHR9XG59KTtcblxuJChcIi5oLWJhY2stYnRuXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQkLm1vYmlsZS5jaGFuZ2VQYWdlKFwiI2phZHdhbC1wYWdlXCIsIHt0cmFuc2l0aW9uOiBcInNsaWRlZG93blwiLCBjaGFuZ2VIYXNoOiBmYWxzZX0pO1xufSk7XG5cbi8vICQoZG9jdW1lbnQpLm9uKFwiYmFja2J1dHRvblwiLCBmdW5jdGlvbihlKSB7XG4vLyBcdGUucHJldmVudERlZmF1bHQoKTtcbi8vIH0pO1xuXG4vLyBfLmdyb3VwQnkoSlNPTi5wYXJzZShzKS5iaW1heV9zY2hlZHVsZSwgZnVuY3Rpb24obykgeyByZXR1cm4gby5kYXRlOyB9KTtcblxuIl19

/** @jsx React.DOM */
var EventClient = React.createClass({
	getInitialState: function() {
		moment.locale("de",
		{
		    monthsShort : "Jan_Febr_März_April_Mai_Juni_Juli_Aug_Sept_Okt_Nov_Dez".split("_")
		});
		moment.locale([window.navigator.language, "en"]);
		return { event: null,
				events: []};
	},
	componentDidMount: function() {
		this.loadEvents();
	},
	loadEvents: function() {
		 $.ajax({
				url: trelev.url + "/api/organisation/x/events",
				contentType: "application/json; charset=utf-8",
				dataType: 'json',
				type: 'GET',
				success: function(data) {
					//console.log("success load events", data)
					//this.setState({data: data});
					data.forEach(function(ev) {
						ev.date = moment(ev.date);
					});
					this.setState({ "events": data});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(status, err);
				}.bind(this)});
	},
	register: function(ev) {
		this.setState({"event": ev});
	},
	render: function() {
		var eventList = 
			this.state.events.map(function(ev) {
				return <EventView event={ev} key={ev.id} onRegister={this.register}/>
			}.bind(this));
		return (<div>
					{eventList}  
					<RegisterDialog event={this.state.event} onSuccess={this.loadEvents}/>
				</div>);
	}
});

var EventView = React.createClass({
	register: function(e) {
		e.preventDefault();
		this.props.onRegister(this.props.event);
	},
	render: function() {

		var regBtn = <button type="button" className="btn btn-large btn-success dropdown-toggle" onClick={this.register}>Anmelden <span className="caret"></span></button>

		var regPart = "";
		if (this.props.event.date.isAfter(new Date())) {
			regPart = <div>
						<div>
							<span className="seats" >
								{this.props.event.maxParticipants-this.props.event.regParticipants}&nbsp;
							</span>
							freie Plätze
						</div>
						{this.props.event.regParticipants === this.props.event.maxParticipants ? "" : regBtn}
					</div>
		}

		var endTime = moment(this.props.event.date).add(this.props.event.duration, "minutes");

		return (
	<div className="row clearfix event">
		<div className="col-xs-12 column">
			<div className="row clearfix">
				<div className="col-xs-3 col-sm-2 col-md-1">
					<div className="month-frame">
						<div className="month">
							{this.props.event.date.format("MMM")}
						</div>
						<div className="month-value">
							{this.props.event.date.format("DD")}
						</div>
					</div>
				</div>
				<div className="col-xs-12 col-sm-8 col-md-7">
					<h4>
						<span className="dateBox">
							
						</span>
						{this.props.event.title}
					</h4>
					<p>{this.props.event.description} </p>
					<div className="row clearfix">
						<div className="col-xs-12">
							<div className="event-prop pull-left"><strong>Wann?</strong> {this.props.event.date.format("HH:mm")}-{endTime.format("HH:mm")} Uhr</div>
							<div className="event-prop pull-left"><strong>Wo?</strong> {this.props.event.location.city}, {this.props.event.location.place}</div>
							<div className="event-prop pull-left"><strong>Von wem?</strong> {this.props.event.firstName} {this.props.event.lastName}</div>
						</div>
					</div>
				</div>
				<div className="col-xs-3 col-sm-2 col-md-4">
					{regPart}
				</div>
			</div>
		</div>
	</div>
		);
	}	
});

var RegisterDialog = React.createClass({
	getInitialState: function() {
		return { 	"closed:" : false,
					"result" : null,
					"participant": 
					{
						"firstName": "",
						"lastName": "",
						"email": "",
						"entourage": {
							"adults": 1,
							"children": 0
						}
					}};	
	},	
	dialogVisible: function() {
		return this.props.event != null && this.state.closed === false;
		//return this.state.closed === false;
	},
	hideDialog: function(e) {
		e.stopPropagation();
		this.setState({"closed":true});
	},
	componentWillReceiveProps: function(nextProps) {
		//only reset the form when properties changes and the dialog is not open in success state (otherwise reload of list makes the success result disappear
		if (!(this.isSuccess() && this.state.closed === false)) {
			this.setState({"closed":false, "result": null});
		}
	},
	participantRegistered: function() {
		this.setState({"result": {"status": "success", "message": "Du hast Dich erfolgreich registriert und bekommst von uns nochmal eine E-mail mit der Bestätigung zugesendet. Viel Spaß!"}});
		this.props.onSuccess();
	},
	registerParticipant: function(e) {
		e.preventDefault();
		var part = this.state.participant;
		if (part.firstName == "" || part.lastName == "" || part.email == "" || part.entourage.adults == 0 && part.entourage.children == 0) {
			this.setState({"result": {"status": "error", "message": "Bitte fülle alle Felder aus."}});
			return;
		}
		var url = trelev.url + "/api/organisation/x/events/" + this.props.event.id + "/participants/" + encodeURIComponent(part.email);
		$.ajax({
				url: url,
				contentType: "application/json; charset=utf-8",
				dataType: 'json',
				type: "POST",
				data: JSON.stringify(part),
				success: function(data) {
					//console.log("success", data);
					//this.props.onSuccess();
					this.participantRegistered();
					//this.loadEvents();
					//this.setEvent(null);
					//this.setState({data: data});
				}.bind(this),
				error: function(xhr, status, err) {
					var appError = $.parseJSON(xhr.responseText);

					var msg = null;
					switch(appError.code) {
						case 501: msg = "Du kannst Dich nur für zukünftige Events anmelden"; break;
						case 502: msg = "Es hat sich schon jemand mit Deiner E-mailadresse angemeldet. Wenn Du Deine Angaben ändern möchtest, schicke doch bitte eine Mail an Advent@treffpunkt-leben.com"; break;
						case 503: msg = "Leider sind nicht mehr genug Plätze frei."; break;
					}
					this.setState({"result": {"status": "error", "message": msg}});
					//console.log("Detailed error", xhr.responseJSON);
					//console.error(xhr, status, err);
				}.bind(this)});
		
	},
	handleChange: function(e) {
		var ev = this.state.participant;
		var val = (e.target.getAttribute("data-type") === "number")?parseInt(e.target.value):e.target.value;
		var sel = e.target.id.split(".");
		switch (sel.length) {
			case 1: ev[sel] = val;
					break;
			case 2: ev[sel[0]][sel[1]] = val;
					break;
		}
		this.setState({"participant": ev});
	},	
	hasError: function() {
		return this.state.result != null && this.state.result.status == "error";
	},
	isSuccess: function() {
		return this.state.result != null && this.state.result.status == "success";
	},
	render: function() {
		var dialogStyle = {display: this.dialogVisible()?"block":"none"};
		var options = [];
		for (var i=0; i<10; i++) {
			options.push(<option key={i}>{i}</option>);
		}
		var errorBody = <div className="bs-callout bs-callout-warning">
							{this.state.result != null ? this.state.result.message : ""}
						</div>


		var formBody = <div>
			       <p>Super, dass Du dabei sein möchtest!</p> 
			       <p>Wir brauchen nur noch ein paar organisatorische Informationen von Dir:</p>
				   {this.hasError() ? errorBody : ""}
					<div className="form-group">
						<label className="col-sm-2" htmlFor="firstName">Vorname</label>
						<div className="col-sm-5">
							<input className="form-control" type="text" id="firstName" value={this.state.participant.firstName} onChange={this.handleChange} required/>
						</div>
					</div>
					<div className="form-group">
						<label className="col-sm-2" htmlFor="lastName">Nachname</label>
						<div className="col-sm-5">
							<input className="form-control" type="text" id="lastName" value={this.state.participant.lastName} onChange={this.handleChange} required/>
						</div>
					</div>
					<div className="form-group">
					<label className="col-sm-2" htmlFor="email">E-mail</label>
						<div className="col-sm-5">
							<input className="form-control" type="email" id="email" value={this.state.participant.email} onChange={this.handleChange} required/>
						</div>
					</div>
					<div className="form-group">
						<div className="col-sm-12">
							Mit wievielen Personen kommst Du insgesamt?
						</div>
					</div>
					<div className="form-group">
						<label className="col-sm-3" htmlFor="entourage.adults">Erwachsene</label>
						<div className="col-sm-2">
							<select id="entourage.adults" data-type="number" className="form-control" value={this.state.participant.entourage.adults} onChange={this.handleChange}>
								{options}
							</select>
						</div>
					</div>
					<div className="form-group">
						<label className="col-sm-3" htmlFor="entourage.children">Kinder</label>
						<div className="col-sm-2">
							<select id="entourage.children" data-type="number" className="form-control" value={this.state.participant.entourage.children} onChange={this.handleChange}>
								{options}
							</select>
						</div>
					</div>
				</div>

		var responseBody = this.state.result != null ? <div>{this.state.result.message}</div> : "";

		var formBtns = <div className="modal-footer">
        <button type="button" onClick={this.hideDialog} className="btn btn-default" data-dismiss="modal">Zurück</button>
		<button type="submit" className="btn btn-success">Anmelden</button>
	   </div>
	   var successBtns = <div className="modal-footer">
        <button type="button" onClick={this.hideDialog} className="btn btn-default" data-dismiss="modal">Schliessen</button>
	   </div>

		return (
<div className={this.dialogVisible()?'modal fade in':'modal fade'} style={dialogStyle}>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <button type="button" className="close" onClick={this.hideDialog} data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
        <h4 className="modal-title">Anmeldung für "{this.props.event?this.props.event.title:""}"</h4>
      </div>
		<form className="form-horizontal" role="form" ref="form" onSubmit={this.registerParticipant}>
      <div className="modal-body">
	  {this.isSuccess() ? responseBody : formBody}
      </div>
	  {this.isSuccess() ? successBtns : formBtns}
		</form>
    </div>
  </div>
</div>
		);
	}
});


React.render(<EventClient />, document.getElementById('content'));

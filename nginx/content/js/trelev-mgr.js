/** @jsx React.DOM */
var EventManager = React.createClass({displayName: "EventManager",
	getInitialState: function() {
		return { event: null,
				events: [],
				token: null,
				tokenValid: false};
	},
	setupNewEvent: function(e) {
		e.preventDefault();
		this.setEvent({
			"id": null,
			"title": "",
			"description": "",
			"date": new Date().toISOString(),
			"duration": 120,
			"host" : {
				"email": "",
				"phone": "",
				"firstName": "",
				"lastName": ""
			},
			"location": {
				"city": "",
				"place": ""
			},
			maxParticipants: 10
		});
	},
	loadEvent: function(id) {
		 $.ajax({
				url: trelev.url + "/api/organisation/x/events/" + id,
				contentType: "application/json; charset=utf-8",
				dataType: 'json',
				type: 'GET',
				headers: {"Authorization": this.state.token},
				success: function(data) {
					//console.log("success load event", data)
					//this.setState({data: data});
					this.setEvent(data);
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(xhr,status, err);
					if (xhr.status == 401 || xhr.status == 404) {
						this.invalidateToken();
					}
				}.bind(this)});
	},
	setEvent: function(event) {
		if (event != null) {
			event.date = moment(event.date).toDate();
		}
		this.setState({"event": event});
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
					this.setState({ "events": data})
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(status, err);
				}.bind(this)});
	},
	submitEvent: function(event) {
		 var url = trelev.url + "/api/organisation/x/events";
		 var method = "POST";
		 if (event.id != null) {
			url = url + "/" + event.id;
			method = "PUT";
			event.informParticipants = true;
		 }
		 $.ajax({
				url: url,
				contentType: "application/json; charset=utf-8",
				dataType: 'json',
				type: method,
				headers: {"Authorization": this.state.token},
				data: JSON.stringify(event),
				success: function(data) {
					//console.log("success", data)
					this.loadEvents();
					this.setEvent(null);
					//this.setState({data: data});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(xhr, status, err);
					if (xhr.status == 401 || xhr.status == 404) {
						this.invalidateToken();
					}
				}.bind(this)});
		
		//this.setState({"event": null});
	},
	deleteEvent: function(id) {
		 $.ajax({
				url: trelev.url + "/api/organisation/x/events/" + id + "?inform=true",
				type: 'DELETE',
				headers: {"Authorization": this.state.token},
				success: function(data) {
					this.loadEvents();
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(xhr, status, err);
					if (xhr.status == 401 || xhr.status == 404) {
						this.invalidateToken();
					}
				}.bind(this)});
		
		//this.setState({"event": null});
	},
	validateToken: function(e) {
		if (e) {
			e.preventDefault();
		}
		this.setState({"tokenValid": true});
	},	
	invalidateToken: function() {
		this.setState({"tokenValid": false});
	},
	updateToken: function(e) {
		e.preventDefault();
		this.setState({"token": e.target.value});
	},
	render: function() {
		return (
		  React.createElement("div", null, 
			React.createElement("div", {className: "row clearfix"}, 
				React.createElement("div", {className: "col-md-12 column"}, 
					React.createElement("div", {className: "page-header"}, 
						React.createElement("h1", null, 
							"trelev - Event Manager"
						)
					), 
					React.createElement("div", {className: "bs-callout bs-callout-warning"}, 
					"This UI works only in recent chrome and safari browsers!"
					), 
					 this.state.event == null ?React.createElement(CreateButton, {onClick: this.setupNewEvent}):null, 
					 this.state.event != null ?React.createElement(ToListButton, {onClick: this.setEvent}):null
				)
			), 
			React.createElement("div", {className: "row clearfix"}, 
				React.createElement("div", {className: "col-md-12 column"}, 
					 this.state.event == null ?React.createElement(EventList, {events: this.state.events, onEventDetail: this.loadEvent, onEventDelete: this.deleteEvent}) : null
				)
			), 
			React.createElement("div", {className: "row clearfix"}, 
				React.createElement("div", {className: "col-md-12 column"}, 
					 this.state.event != null ?React.createElement(EventView, {event: this.state.event, onSubmit: this.submitEvent, onUpdate: this.setEvent, onChange: this.loadEvents, token: this.state.token, onTokenInvalid: this.invalidateToken}) : null
				)
			), 
			React.createElement(TokenDialog, {token: this.state.token, tokenValid: this.state.tokenValid, onTokenDone: this.validateToken, onTokenUpdate: this.updateToken})
		)
			
		);
	}
	});
var CreateButton = React.createClass({displayName: "CreateButton",
	render: function() {
		return (
			React.createElement("button", {onClick: this.props.onClick, type: "button", className: "btn btn-default"}, "Create new event")
		);
	}
	});
var ToListButton = React.createClass({displayName: "ToListButton",
	clearEvent: function() {
		this.props.onClick(null);
	},
	render: function() {
		return (
			React.createElement("button", {onClick: this.clearEvent, type: "button", className: "btn btn-default"}, "Back to event list")
		);
	}
	});
var EventList = React.createClass({displayName: "EventList",
	render: function() {
		var param = this.props;
		var listNodes = this.props.events.map(function(event) {
			return React.createElement(ListedEvent, {key: event.id, event: event, onDetail: param.onEventDetail, onDelete: param.onEventDelete});
		});
		return (
				React.createElement("table", {className: "table"}, 
				React.createElement("thead", null, 
					React.createElement("tr", null, 
						React.createElement("th", null, " Title "), 
						React.createElement("th", null, " Host "), 
						React.createElement("th", null, " Date "), 
						React.createElement("th", null, " City "), 
						React.createElement("th", null, " Participants "), 
						React.createElement("th", null, " ")
					)
				), 
				React.createElement("tbody", null, 
					listNodes
				)
				)
		);
	}
	});
var ListedEvent = React.createClass({displayName: "ListedEvent",
	formatDate: function() {
		var mom = moment(this.props.event.date);
		return mom.format("DD.MM HH:mm")
	},
	onDetail: function() {
		this.props.onDetail(this.props.event.id);
	},
	onDelete: function() {
		this.props.onDelete(this.props.event.id);
	},
	render: function() {
		return (
			React.createElement("tr", null, 
				React.createElement("td", null, " ", this.props.event.title), 
				React.createElement("td", null, " ", this.props.event.firstName, " ", this.props.event.lastName), 
				React.createElement("td", null, " ", this.formatDate()), 
				React.createElement("td", null, " ", this.props.event.location.city), 
				React.createElement("td", null, " ", this.props.event.regParticipants, "/", this.props.event.maxParticipants, " "), 
				React.createElement("td", null, 
					React.createElement("button", {type: "button", className: "btn btn-primary btn-sm", onClick: this.onDetail}, "Details"), 
					React.createElement("button", {type: "button", className: "btn btn-danger btn-sm", onClick: this.onDelete}, "Remove")
				)
			)
		);
	}
});
var EventView = React.createClass({displayName: "EventView",
	getInitialState: function() {
	/*Always handle the date locally as otherwise it gets reparsed all the time which doesn't work well together with datetime-local*/
		return {"modeDetail": true, "dt": this.convertDate(this.props.event.date)}
	},
	/*componentWillReceiveProps: function(nextProps) {
		console.log("props changed, change state");
		this.setState({"event": nextProps.event, "dt": this.convertDate(nextProps.event.date)});
	},*/
	convertDate: function(dt) {
		var ds2 = moment(dt).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm");
		return ds2;
	},
	handleChange: function(e) {
		var ev = this.props.event;
		var val = e.target.type === "number"?parseInt(e.target.value):e.target.value;
		var sel = e.target.id.split(".");
		switch (sel.length) {
			case 1: ev[sel] = val;
					break;
			case 2: ev[sel[0]][sel[1]] = val;
					break;
		}
		this.props.onUpdate(ev);
	},
	handleDate: function(e) {
		this.setState({"dt": e.target.value});
	},
	handleMode: function(mode) {
		return function(e) {
			e.preventDefault();
			this.setState({"modeDetail": mode})
		}.bind(this);
	},
	onSubmit: function(e) {
		e.preventDefault();
		//special date treatment
		var ev = this.props.event;
		ev.date = this.state.dt;
		this.props.onUpdate(ev);
		//end

		this.props.onSubmit(this.props.event);
	},
	render: function() {
		var modeNav = React.createElement("ul", {className: "nav nav-tabs", role: "tablist"}, 
						React.createElement("li", {role: "presentation", className: this.state.modeDetail?"active":"", onClick: this.handleMode(true)}, React.createElement("a", {href: "#"}, "Details")), 
						React.createElement("li", {role: "presentation", className: this.state.modeDetail == false?"active":"", onClick: this.handleMode(false)}, React.createElement("a", {href: "#"}, "Participants"))
					 );
		var parts = React.createElement(ParticipantList, {event: this.props.event, onChange: this.props.onChange, token: this.props.token, onTokenInvalid: this.props.onTokenInvalid});
		var form = React.createElement("form", {role: "form", onSubmit: this.onSubmit}, 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "title"}, "Title"), 
						React.createElement("input", {type: "text", className: "form-control", id: "title", value: this.props.event.title, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "description"}, "Description"), 
						React.createElement("textarea", {className: "form-control", rows: "3", id: "description", value: this.props.event.description, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "date"}, "Datetime"), 
						React.createElement("input", {type: "datetime-local", className: "form-control", id: "date", value: this.state.dt, onChange: this.handleDate})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "duration"}, "Duration (min)"), 
						React.createElement("input", {ref: "duration", type: "number", className: "form-control", id: "duration", size: "3", value: this.props.event.duration, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "host.firstName"}, "Firstname of host"), 
						React.createElement("input", {type: "text", className: "form-control", id: "host.firstName", value: this.props.event.host.firstName, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "host.lastName"}, "Lastname of host"), 
						React.createElement("input", {type: "text", className: "form-control", id: "host.lastName", value: this.props.event.host.lastName, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "host.email"}, "Host email"), 
						React.createElement("input", {type: "email", className: "form-control", id: "host.email", value: this.props.event.host.email, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "host.phone"}, "Host phone"), 
						React.createElement("input", {type: "text", className: "form-control", id: "host.phone", value: this.props.event.host.phone, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "location.city"}, "City"), 
						React.createElement("input", {type: "text", className: "form-control", id: "location.city", value: this.props.event.location.city, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "location.place"}, "Place (e.g. @home)"), 
						React.createElement("input", {type: "text", className: "form-control", id: "location.place", value: this.props.event.location.place, onChange: this.handleChange})
					), 
					React.createElement("div", {className: "form-group"}, 
						React.createElement("label", {htmlFor: "maxParticipants"}, "Capacity"), 
						React.createElement("input", {type: "number", className: "form-control", id: "maxParticipants", size: "3", value: this.props.event.maxParticipants, onChange: this.handleChange})
					), 
					React.createElement("button", {type: "submit", className: "btn btn-default"}, "Save")
				);
		return (
			React.createElement("div", null, 
				this.props.event.id != null?modeNav:null, 
				this.state.modeDetail?form:null, 
				this.state.modeDetail==false?parts:null
			)
		);
	}
});

var ParticipantList = React.createClass({displayName: "ParticipantList",
	getInitialState: function() {
		//console.log("initial state");
		return {"parts": []}
	},
	componentDidMount: function() {
		//console.log("mounted");
		this.loadParticipants();
	},
	loadParticipants: function() {
		 $.ajax({
				url: trelev.url + "/api/organisation/x/events/" + this.props.event.id + "/participants",
				contentType: "application/json; charset=utf-8",
				dataType: 'json',
				type: 'GET',
				headers: {"Authorization": this.props.token},
				success: function(data) {
					//console.log("success load parts", data)
					this.setState({ "parts": data})
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(xhr, status, err);
					if (xhr.status == 401 || xhr.status == 404) {
						this.props.onTokenInvalid();
					}
				}.bind(this)});
	},
	deleteParticipant: function(email) {
		 $.ajax({
				url: trelev.url + "/api/organisation/x/events/" + this.props.event.id + "/participants/" + encodeURIComponent(email),
				type: 'DELETE',
				headers: {"Authorization": this.props.token},
				success: function(data) {
					//console.log("success load parts", data)
					this.loadParticipants();
					this.props.onChange();
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(status, err);
					if (xhr.status == 401 || xhr.status == 404) {
						this.props.onTokenInvalid();
					}
				}.bind(this)});
	},
	render: function() {
		var plist = this.state.parts.map(function(p){
			return React.createElement(ParticipantEntry, {part: p, onDelete: this.deleteParticipant, key: p.email})
		}.bind(this));
		var pelist = "mailto:" + this.state.parts.map(function(p) {
			return p.email;
		}).join(",");
		return (
			React.createElement("div", null, 
				React.createElement("a", {href: pelist}, React.createElement("button", {type: "button", className: "btn btn-default"}, "Mail to all participants")), 
				React.createElement("table", {className: "table"}, 
				React.createElement("thead", null, 
					React.createElement("tr", null, 
						React.createElement("th", null, " Name "), 
						React.createElement("th", null, " E-mail "), 
						React.createElement("th", null, " Adults "), 
						React.createElement("th", null, " Children "), 
						React.createElement("th", null, " ")
					)
				), 
				React.createElement("tbody", null, 
					plist
				)
				)
			)
		);
	}
});
var ParticipantEntry = React.createClass({displayName: "ParticipantEntry",
	/*formatDate: function() {
		var mom = moment(this.props.event.date);
		return mom.format("DD.MM HH:mm")
	},*/
	onDelete: function(e) {
		e.preventDefault();
		this.props.onDelete(this.props.part.email);
	},
	render: function() {
		return (React.createElement("tr", null, 
				React.createElement("td", null, " ", this.props.part.firstName, " ", this.props.part.lastName), 
				React.createElement("td", null, " ", this.props.part.email), 
				React.createElement("td", null, " ", this.props.part.entourage.adults), 
				React.createElement("td", null, " ", this.props.part.entourage.children), 
				React.createElement("td", null, 
					React.createElement("button", {type: "button", className: "btn btn-danger btn-sm", onClick: this.onDelete}, "Remove")
				)
			)

		);
	}
});

var TokenDialog = React.createClass({displayName: "TokenDialog",
	dialogVisible: function() {
		return this.props.tokenValid == false;
	},
	render: function() {
		var dialogStyle = {display: this.dialogVisible()?"block":"none"};

		return(
		React.createElement("div", {className: this.dialogVisible()?'modal fade in':'modal fade', style: dialogStyle}, 
		React.createElement("div", {className: "modal-dialog"}, 
			React.createElement("div", {className: "modal-content"}, 
			React.createElement("div", {className: "modal-header"}, 
				React.createElement("h4", {className: "modal-title"}, "Enter token")
			), 
				React.createElement("form", {className: "form-horizontal", role: "form", ref: "form", onSubmit: this.props.onTokenDone}, 
			React.createElement("div", {className: "modal-body"}, 
				React.createElement("p", null, "You need to enter a valid token to access some of the functionality"), 
				React.createElement("label", {htmlFor: "token"}, "Token"), 
				React.createElement("input", {type: "password", className: "form-control", id: "token", value: this.props.token, onChange: this.props.onTokenUpdate})
			), 
			React.createElement("div", {className: "modal-footer"}, 
				React.createElement("button", {type: "submit", className: "btn btn-primary"}, "Submit")
			)
				)
			)
		)
		)
		);
	}
});

React.render(React.createElement(EventManager, null), document.getElementById('content'));

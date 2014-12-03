/** @jsx React.DOM */
var EventManager = React.createClass({
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
			event.informParticipants = false;
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
				url: trelev.url + "/api/organisation/x/events/" + id,
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
		  <div>
			<div className="row clearfix">
				<div className="col-md-12 column">
					<div className="page-header">
						<h1>
							trelev - Event Manager
						</h1>
					</div>
					<div className="bs-callout bs-callout-warning">
					This UI works only in recent chrome and safari browsers!
					</div>
					{ this.state.event == null ?<CreateButton onClick={this.setupNewEvent}/>:null}
					{ this.state.event != null ?<ToListButton onClick={this.setEvent}/>:null}
				</div>
			</div>
			<div className="row clearfix">
				<div className="col-md-12 column">
					{ this.state.event == null ?<EventList events={this.state.events} onEventDetail={this.loadEvent} onEventDelete={this.deleteEvent}/> : null}
				</div>
			</div>
			<div className="row clearfix">
				<div className="col-md-12 column">
					{ this.state.event != null ?<EventView event={this.state.event} onSubmit={this.submitEvent} onUpdate={this.setEvent} onChange={this.loadEvents} token={this.state.token} onTokenInvalid={this.invalidateToken}/> : null }
				</div>
			</div>
			<TokenDialog token={this.state.token} tokenValid={this.state.tokenValid} onTokenDone={this.validateToken} onTokenUpdate={this.updateToken} />
		</div>
			
		);
	}
	});
var CreateButton = React.createClass({
	render: function() {
		return (
			<button onClick={this.props.onClick} type="button" className="btn btn-default">Create new event</button>
		);
	}
	});
var ToListButton = React.createClass({
	clearEvent: function() {
		this.props.onClick(null);
	},
	render: function() {
		return (
			<button onClick={this.clearEvent} type="button" className="btn btn-default">Back to event list</button>
		);
	}
	});
var EventList = React.createClass({
	render: function() {
		var param = this.props;
		var listNodes = this.props.events.map(function(event) {
			return <ListedEvent key={event.id} event={event} onDetail={param.onEventDetail} onDelete={param.onEventDelete}/>;
		});
		return (
				<table className="table">
				<thead>
					<tr>
						<th> Title </th>
						<th> Host </th>
						<th> Date </th>
						<th> City </th>
						<th> Participants </th>
						<th> </th>
					</tr>
				</thead>
				<tbody>
					{listNodes}
				</tbody>
				</table>
		);
	}
	});
var ListedEvent = React.createClass({
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
			<tr>
				<td> {this.props.event.title}</td>
				<td> {this.props.event.firstName} {this.props.event.lastName}</td>
				<td> {this.formatDate()}</td>
				<td> {this.props.event.location.city}</td>
				<td> {this.props.event.regParticipants}/{this.props.event.maxParticipants} </td>
				<td>
					<button type="button" className="btn btn-primary btn-sm" onClick={this.onDetail}>Details</button>
					<button type="button" className="btn btn-danger btn-sm" onClick={this.onDelete}>Remove</button>
				</td>
			</tr>
		);
	}
});
var EventView = React.createClass({
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
		var modeNav = <ul className="nav nav-tabs" role="tablist">
						<li role="presentation" className={this.state.modeDetail?"active":""} onClick={this.handleMode(true)}><a href="#">Details</a></li>
						<li role="presentation" className={this.state.modeDetail == false?"active":""} onClick={this.handleMode(false)}><a href="#">Participants</a></li>
					 </ul>;
		var parts = <ParticipantList event={this.props.event} onChange={this.props.onChange} token={this.props.token} onTokenInvalid={this.props.onTokenInvalid}/>;
		var form = <form role="form" onSubmit={this.onSubmit}>
					<div className="form-group">
						<label htmlFor="title">Title</label>
						<input type="text" className="form-control" id="title" value={this.props.event.title} onChange={this.handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="description">Description</label>
						<textarea className="form-control" rows="3" id="description" value={this.props.event.description} onChange={this.handleChange} ></textarea>
					</div>
					<div className="form-group">
						<label htmlFor="date">Datetime</label>
						<input type="datetime-local" className="form-control" id="date" value={this.state.dt} onChange={this.handleDate} />
					</div>
					<div className="form-group">
						<label htmlFor="duration">Duration (min)</label>
						<input ref="duration" type="number" className="form-control" id="duration" size="3" value={this.props.event.duration} onChange={this.handleChange}/>
					</div>
					<div className="form-group">
						<label htmlFor="host.firstName">Firstname of host</label>
						<input type="text" className="form-control" id="host.firstName" value={this.props.event.host.firstName} onChange={this.handleChange}/>
					</div>
					<div className="form-group">
						<label htmlFor="host.lastName">Lastname of host</label>
						<input type="text" className="form-control" id="host.lastName" value={this.props.event.host.lastName} onChange={this.handleChange}/>
					</div>
					<div className="form-group">
						<label htmlFor="host.email">Host email</label>
						<input type="email" className="form-control" id="host.email" value={this.props.event.host.email} onChange={this.handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="host.phone">Host phone</label>
						<input type="text" className="form-control" id="host.phone" value={this.props.event.host.phone} onChange={this.handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="location.city">City</label>
						<input type="text" className="form-control" id="location.city" value={this.props.event.location.city} onChange={this.handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="location.place">Place (e.g. @home)</label>
						<input type="text" className="form-control" id="location.place" value={this.props.event.location.place} onChange={this.handleChange} />
					</div>
					<div className="form-group">
						<label htmlFor="maxParticipants">Capacity</label>
						<input type="number" className="form-control" id="maxParticipants" size="3" value={this.props.event.maxParticipants} onChange={this.handleChange} />
					</div>
					<button type="submit" className="btn btn-default">Save</button>
				</form>;
		return (
			<div>
				{this.props.event.id != null?modeNav:null}
				{this.state.modeDetail?form:null}
				{this.state.modeDetail==false?parts:null}
			</div>
		);
	}
});

var ParticipantList = React.createClass({
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
			return <ParticipantEntry part={p} onDelete={this.deleteParticipant} key={p.email}/>
		}.bind(this));
		return (
			<table className="table">
			<thead>
				<tr>
					<th> Name </th>
					<th> E-mail </th>
					<th> Adults </th>
					<th> Children </th>
					<th> </th>
				</tr>
			</thead>
			<tbody>
				{plist}
			</tbody>
			</table>
		);
	}
});
var ParticipantEntry = React.createClass({
	/*formatDate: function() {
		var mom = moment(this.props.event.date);
		return mom.format("DD.MM HH:mm")
	},*/
	onDelete: function(e) {
		e.preventDefault();
		this.props.onDelete(this.props.part.email);
	},
	render: function() {
		return (<tr>
				<td> {this.props.part.firstName} {this.props.part.lastName}</td>
				<td> {this.props.part.email}</td>
				<td> {this.props.part.entourage.adults}</td>
				<td> {this.props.part.entourage.children}</td>
				<td>
					<button type="button" className="btn btn-danger btn-sm" onClick={this.onDelete}>Remove</button>
				</td>
			</tr>

		);
	}
});

var TokenDialog = React.createClass({
	dialogVisible: function() {
		return this.props.tokenValid == false;
	},
	render: function() {
		var dialogStyle = {display: this.dialogVisible()?"block":"none"};

		return(
		<div className={this.dialogVisible()?'modal fade in':'modal fade'} style={dialogStyle}>
		<div className="modal-dialog">
			<div className="modal-content">
			<div className="modal-header">
				<h4 className="modal-title">Enter token</h4>
			</div>
				<form className="form-horizontal" role="form" ref="form" onSubmit={this.props.onTokenDone}>
			<div className="modal-body">
				<p>You need to enter a valid token to access some of the functionality</p>
				<label htmlFor="token">Token</label>
				<input type="text" className="form-control" id="token" value={this.props.token} onChange={this.props.onTokenUpdate} />
			</div>
			<div className="modal-footer">
				<button type="submit" className="btn btn-primary">Submit</button>
			</div>
				</form>
			</div>
		</div>
		</div>
		);
	}
});

React.render(<EventManager />, document.getElementById('content'));

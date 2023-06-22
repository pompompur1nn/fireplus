class PillToggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      on: false
    };
    this.getValue();
  }

  getValue() {
    let pillToggle = this;
    this.props.getValue(function (value) {
      pillToggle.setState({
        on: !!value
      });
    });
  }

  toggle() {
    if (this.props.disabled) {
      return;
    }

    var on = !this.state.on;
    this.setState({
      on: on
    });
    this.props.onToggle(on);
  }

  render() {
    return /*#__PURE__*/React.createElement("span", {
      class: "btn-toggle receiver-destination-type-toggle" + (this.state.on ? " on" : "") + (this.props.disabled ? " disabled" : ""),
      onClick: this.toggle.bind(this)
    }, /*#__PURE__*/React.createElement("span", {
      class: "toggle-flip"
    }), /*#__PURE__*/React.createElement("span", {
      class: "toggle-on"
    }), /*#__PURE__*/React.createElement("span", {
      class: "toggle-off"
    }));
  }

}
class VerticalTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.defaultTab || props.tabs[0]
    };
  }

  selectTab(tab) {
    this.setState({
      activeTab: tab
    });
  }

  render() {
    let verticalTabs = this;
    let activeTab = this.state.activeTab;
    let tabListItems = [];
    let tabContentDivs = [];
    this.props.tabs.forEach(function (tab) {
      let tabContent = React.createElement(tab.class, tab.props || {});
      tabListItems.push( /*#__PURE__*/React.createElement("li", {
        className: "menu-option" + (tab === activeTab ? " active" : ""),
        onClick: verticalTabs.selectTab.bind(verticalTabs, tab)
      }, /*#__PURE__*/React.createElement("a", {
        class: "rbx-tab-heading"
      }, /*#__PURE__*/React.createElement("span", {
        class: "font-caption-header"
      }, tab.label))));
      tabContentDivs.push( /*#__PURE__*/React.createElement("div", {
        className: "tab-pane" + (activeTab === tab ? " active" : "")
      }, tabContent));
    });
    return /*#__PURE__*/React.createElement("div", {
      class: "menu-vertical-container"
    }, /*#__PURE__*/React.createElement("ul", {
      class: "menu-vertical"
    }, tabListItems), /*#__PURE__*/React.createElement("div", {
      class: "tab-content rbx-tab-content"
    }, tabContentDivs));
  }

}
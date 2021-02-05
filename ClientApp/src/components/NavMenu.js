import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, NavbarText } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor (props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
    };
  }

  toggleNavbar () {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }


  async logout () {
    const resp = await fetch(`/auth`, {
      method: "DELETE"
    })
    if (resp.ok) {
      window.location.reload()
    }
  }

  render () {
    let logoutComp = <NavItem>
      <NavbarText className="text-dark">
        Not Logged In!
      </NavbarText>
    </NavItem>
    if (this.props.user.userName.length > 0)
      logoutComp =
          <>
            <NavItem>
              <NavbarText className="text-dark">
                {this.props.user.userName} ({Math.round(this.props.user.elo)})
              </NavbarText>
            </NavItem>
          <NavItem>
            <NavLink className="text-dark" onClick={this.logout}>
              <i className="fa fa-sign-out" aria-hidden="true"></i>
            </NavLink>
          </NavItem>
          </>
    return (
      <header>
        <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
          <Container>
            <NavbarBrand tag={Link} to="/">Multiplayer-Lama</NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/game">Play</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/leaderboard">Ranking</NavLink>
                </NavItem>
                {logoutComp}
              </ul>
            </Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }
}

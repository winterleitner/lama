import React, {useState, useEffect} from "react"
import {HomeAd} from "./Ads/HomeAd";

export const Login = props => {
    const [loading, setLoading] = useState(false)
    const [loginName, setLoginName] = useState("")
    const [loginPw, setLoginPw] = useState("")
    const [registerName, setRegisterName] = useState("")
    const [registerPw, setRegisterPw] = useState("")
    const [registerPwRepeat, setRegisterPwRepeat] = useState("")
    const [registerEmail, setRegisterEmail] = useState("")
    const [loginFailed, setLoginFailed] = useState(false)
    const [userNameTaken, setUserNameTaken] = useState(false)
    const [registerPwMismatch, setRegisterPwMismatch] = useState(false)
    const [pwTooShort, setPwTooShort] = useState(false)

    const login = async () => {
        setLoading(true)
        const fd = new FormData()
        fd.append("username", loginName)
        fd.append("password", loginPw)
        const resp = await fetch(`/auth`, {
            method: "POST",
            body: fd
        })
        if (resp.ok) {
            setLoginFailed(false)
            props.success()
        }
        else setLoginFailed(true)
        setLoading(false)
    }
    
    const register = async () => {
        setLoading(true)
        const fd = new FormData()
        fd.append("username", registerName)
        fd.append("email", registerEmail)
        fd.append("password", registerPw)
        const resp = await fetch(`/auth/register`, {
            method: "POST",
            body: fd
        })
        if (resp.ok) {
            props.success()
        }
        setLoading(false)
    }
    
    const onRegisterUserNameChanged = async (name) => {
        setRegisterName(name)
        await checkUserName(name)
    }
    
    const checkUserName = async (name) => {
        const resp = await fetch(`/auth/${name}`, {
            method: "GET"
        })
        if (resp.ok) {
            setUserNameTaken(true)
        }
        else setUserNameTaken(false)
    }
    
    useEffect(() => {
        if (registerPw !== registerPwRepeat) setRegisterPwMismatch(true)
        else setRegisterPwMismatch(false)
        if (registerPw.length < 6)  setPwTooShort(true)
        else setPwTooShort(false)
    }, [registerPw, registerPwRepeat])
    
    return (
        <div>
            <h1>Please Log in Or Register</h1>
            <HomeAd/>
            <div className={"container" + (loading ? " blurred" : "")}>
                <div className="row">
                    <div className="col-md-12 col-lg-6">
                        <h2>Log In</h2>
                        <input className="form-control mt-1 mb-2" type="text" placeholder="Username" value={loginName}
                               onChange={e => setLoginName(e.target.value)}/>
                        <input className="form-control mt-1 mb-2" type="password" placeholder="Password" value={loginPw}
                               onChange={e => setLoginPw(e.target.value)}/>
                        <button className="btn btn-success" onClick={login}>Log In</button>
                        {loginFailed &&
                            <div className="text-danger">
                                Login failed!
                            </div>}
                    </div>
                    <div className="col-md-12 col-lg-6">
                        <h2>Register</h2>
                        <input className={"form-control mt-1 mb-2" + (userNameTaken ? " is-invalid" : "")} type="text" placeholder="Username"
                               value={registerName}
                               onChange={e => onRegisterUserNameChanged(e.target.value)}/>
                        {userNameTaken &&
                        <div className="text-danger">
                            Username {registerName} already taken!
                        </div>}
                        <input className="form-control mt-1 mb-2" type="email" placeholder="Email (optional)"
                               value={registerEmail}
                               onChange={e => setRegisterEmail(e.target.value)}/>
                        <input className={"form-control mt-1 mb-2" + (registerPwMismatch ? " is-invalid" : "")} type="password" placeholder="Password"
                               value={registerPw}
                               onChange={e => setRegisterPw(e.target.value)}/>
                        <input className={"form-control mt-1 mb-2" + (registerPwMismatch ? " is-invalid" : "")} type="password" placeholder="Repeat Password"
                               value={registerPwRepeat}
                               onChange={e => setRegisterPwRepeat(e.target.value)}/>
                        {pwTooShort ? <div className="text-danger">
                            Password needs to be 6 Charactes long!
                        </div> : registerPwMismatch &&
                        <div className="text-danger">
                            Passwords do not match!
                        </div>}
                        <button className="btn btn-success" onClick={register}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
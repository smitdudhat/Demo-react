import React, { useContext, useState } from 'react';
import Navbar from "./Navbar";
import { Redirect } from "@reach/router";
import Loader from "../loader.gif";
import axios from 'axios';
import clientConfig from '../client-config';
import AppContext from "./context/AppContext";

import '../../public/assets/css/login_util.css';
import '../../public/assets/css/login.css';


const Login = () => {

	const inputchange = (e) => {

		if(e.target.value.trim() != '') {
			e.target.classList.add("has-val");
		}
		else {
			e.target.classList.remove("has-val");
		}
	};

	const [store, setStore] = useContext(AppContext);

	const [loginFields, setLoginFields] = useState({
		username: '',
		password: '',
		userNiceName: '',
		userEmail: '',
		loading: false,
		error: ''
	});

	const createMarkup = (data) => ({
		__html: data
	});

	const onFormSubmit = (event) => {
		event.preventDefault();

		const siteUrl = clientConfig.siteUrl;

		const loginData = {
			username: loginFields.username,
			password: loginFields.password,
		};

		setLoginFields({ ...loginFields, loading: true });

		axios.post(`${siteUrl}/wp-json/jwt-auth/v1/token`, loginData)
			.then(res => {

				if (undefined === res.data.token) {
					setLoginFields({
						...loginFields,
						error: res.data.message,
						loading: false
					}
					);
					return;
				}

				const { token, user_nicename, user_email } = res.data;

				localStorage.setItem('token', token);
				localStorage.setItem('userName', user_nicename);

				setStore({
					...store,
					userName: user_nicename,
					token: token
				});

				setLoginFields({
					...loginFields,
					loading: false,
					token: token,
					userNiceName: user_nicename,
					userEmail: user_email,
				})
			})
			.catch(err => {
				setLoginFields({ ...loginFields, error: err.response.data.message, loading: false });
			})
	};

	const handleOnChange = (event) => {
		setLoginFields({ ...loginFields, [event.target.name]: event.target.value });
	};


	const { username, password, userNiceName, error, loading } = loginFields;

	if (store.token) {
		return (<Redirect to={`/dashboard`} noThrow />)
	} else {
		return (
			<React.Fragment>

				<div className="limiter">
					<div className="container-login100">
						<div className="wrap-login100">
							<form className="login100-form validate-form" onSubmit={onFormSubmit} autoComplete="off">
								<span className="login100-form-title p-b-43">
									Login to continue
								</span>
								{error && <div className="alert alert-danger" dangerouslySetInnerHTML={createMarkup(error)} />}
								<div className="wrap-input100 validate-input">
									<input type="text" className="input100" name="username" value={username} autoComplete="off"
										onLoad={inputchange}
										onBlur={inputchange}
										onChange={handleOnChange} />
									<span className="focus-input100"></span>
									<span className="label-input100">Email</span>
								</div>
								<div className="wrap-input100 validate-input">
									<input type="password" className="input100" name="password" value={password} autoComplete="new-password"
										onBlur={inputchange}
										onChange={handleOnChange} />
									<span className="focus-input100"></span>
									<span className="label-input100">Password</span>
								</div>
								<div className="container-login100-form-btn">
									<button className="login100-form-btn" type="submit">
										Login
									</button>
								</div>
								{loading && <img className="loader" src={Loader} alt="Loader" />}
							</form>
							<div className="login100-more login_bg_img"></div>
						</div>
					</div>
				</div>

			</React.Fragment>
		)
	}
};

export default Login;

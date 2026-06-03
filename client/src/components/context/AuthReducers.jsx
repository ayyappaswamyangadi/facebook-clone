const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return {
                user: null,
                loading: true,
                error: false
            }

        case "LOGIN_SUCCESS":
            return {
                user: action.payload,
                loading: false,
                error: null
            }

        case "LOGIN_FAILURE":
            return {
                user: null,
                loading: false,
                error: action.payload
            }
        case "LOGOUT":
            return {
                user: null,
                loading: false,
                error: null,
            }

        case "FOLLOW":
            return {
                ...state,
                user: {
                    ...state.user,
                    following: [...state.user.following, action.payload]
                }
            }

        case "UNFOLLOW":
            return {
                ...state,
                user: {
                    ...state.user,
                    following: state.user.following.filter(following => following !== action.payload)
                }
            }

        case "UPDATE_USER":
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload
                }
            }

        default: return state
    }
}

export default AuthReducer
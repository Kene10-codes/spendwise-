function financeReducer(state, action){
    switch(action.type){
        case "ADD_TRANSACTION":
            return {
                ...state,
                transactions: [action.payload, ...state.transactions]
            }

            case "DELETE_TRANSACTION":
                return{
                    ...state,
                    transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
                }

            case "ADD_BUDGET":
                return {
                    ...state,
                    budgets: [action.payload, ...state.budgets]
                }

                case "DELETE_BUDGET":
                    return {
                        ...state,
                        budgets: state.budgets.filter(budget => budget.id !== action.payload)
                    }
                    
                    default:
                    return state
    }
}

export { financeReducer }
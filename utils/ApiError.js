class ApiError extends Error{

    constructor(statusCode, message, errors=[]){

        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.data = null;
    }
}

export default ApiError;
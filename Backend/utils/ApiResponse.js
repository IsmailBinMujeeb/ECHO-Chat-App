class ApiResponse{

    constructor(statusCode=200, data, message='ok', success){

        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = success || statusCode < 399;
    }
}

export default ApiResponse;
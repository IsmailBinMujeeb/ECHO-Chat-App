import bcrypt from "bcryptjs";

export const hashPasswordMongooseMiddleware = async function (next){

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
}

export const comparePasswordMongooseMiddleware = async function(password){

    return await bcrypt.compare(password, this.password);
}
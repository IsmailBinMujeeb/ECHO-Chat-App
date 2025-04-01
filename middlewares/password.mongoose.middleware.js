import bcrypt from "bcryptjs";

export const hashPasswordMongooseMiddleware = async function (next){

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
}
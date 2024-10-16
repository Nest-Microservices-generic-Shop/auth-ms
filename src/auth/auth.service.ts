import { Injectable, OnModuleInit, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import *as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { JwtPyload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';


@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit{
    

    constructor(
        private readonly jwtService: JwtService
    ){
        super();
    }
    
    async onModuleInit() {
        await this.$connect();
    }  

    async signJwt(payload: JwtPyload){
        return this.jwtService.sign(payload);
    }


    async registerUser(registerUserDto: RegisterUserDto){
        const {name, password, email}= registerUserDto
        try{   

            const  user = await this.user.findFirst({
                where:{email:email}
            });

            if(user){
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: `User alrready exist`
                })
            }

            const newUser = await this.user.create({
                data:{
                    name,
                    password: bcrypt.hashSync(password, 10),
                    email
                }
            });

            const {password: __, ...rest} = newUser

            return {
                user:rest,
                token: await this.signJwt(rest)
            }

        }catch(error){
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message
            })
        }
    }

    async loginUser(loginUserDto: LoginUserDto){
        const {password, email}= loginUserDto
        try{   

            const  user = await this.user.findFirst({
                where:{email:email}
            });

            if(!user){
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: `Invalid credentials 1`
                })
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if(!isPasswordValid){
                throw new RpcException({
                    status: HttpStatus.BAD_REQUEST,
                    message: `Invalid credentials`
                })
            }


            const {password: __, ...rest} = user

            return {
                user:rest,
                token: await this.signJwt(rest)
            }




        }catch(error){
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message
            })
        }
    }

    async verifyToken(token:string){
        try {
            const {sub, iat, exp, ...user} = this.jwtService.verify(token, {
                secret: envs.jwtSecret
            });

            return {
                user,
                token: this.jwtService.sign(user)
            }

        } catch (error) {
            throw new RpcException({
                status: HttpStatus.UNAUTHORIZED,
                message: `Invalid token`
            })
        }
    }
    

}

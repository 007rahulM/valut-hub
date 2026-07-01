import { PrismaClient } from "@prisma/client";

//singleton pattern : only one prismacleint instance exists

const prisma=new PrismaClient();

export default prisma;



# 使用 node:18 作为基础镜像
FROM node:18.20.2

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock tsconfig.json ./

# 设置生产环境变量
ENV NODE_ENV=production

# 安装依赖
RUN npm config set  registry https://repo.huaweicloud.com/repository/npm/
RUN yarn install 

# 复制其余的应用程序代码
COPY . .

# 构建项目
RUN yarn build


# 暴露应用端口
EXPOSE 5001

# 启动应用
CMD ["yarn", "start"]

const express = require('express')
const app = express()
const taskList = require('./tasks.json')
const fs = require('fs')
const path = require('path')
const graphql = require('graphql')
const { 
    GraphQLSchema, 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLBoolean, 
    GraphQLList 
} = require("graphql") 
const { graphqlHTTP } = require('express-graphql')




// Defining Types
const TaskType = new GraphQLObjectType({
    name: "Task",
    fields: () => ({
        id: { type: GraphQLInt },
        task: { type: GraphQLString },
        isDone: { type: GraphQLBoolean }
    })
})

// Resolvers
const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields: {
        getAllTasks: {
            type: new GraphQLList(TaskType),
            args: { id: {type: GraphQLInt}},
            resolve(parent: any, args: any){
                return taskList
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createTask: {
            type: TaskType,
            args: {
                task: { type: GraphQLString}
            },
            resolve(parent: any, args: any){
                const lastTask = taskList[taskList.length - 1];
                const newTask = {
                    id: lastTask.id + 1,
                    task: args.task,
                    isDone: false
                }
                taskList.push(newTask)

                const filePath = path.join(__dirname, 'tasks.json');
                fs.writeFileSync(filePath, JSON.stringify(taskList, null, 2));
                return newTask;
            }
        },
        deleteTask: {
            type: TaskType,
            args: {
                id: { type: GraphQLInt }
            },
            resolve(parent: any, args: any){
                const taskIndex = taskList.findIndex((task:any) => task.id === args.id);
                if (taskIndex !== -1) {
                    const deletedTask = taskList.splice(taskIndex, 1)[0];
                    const filePath = path.join(__dirname, 'tasks.json');
                    fs.writeFileSync(filePath, JSON.stringify(taskList, null, 2));
                    return deletedTask;
                }
                return null;
            }
        },
        checkTask: {
            type: TaskType,
            args: {
                id: { type: GraphQLInt }
            },
            resolve(parent: any, args: any){
                const task = taskList.find((task:any) => task.id === args.id);
                if (!task) {
                    throw new Error(`Task with id ${args.id} not found`);
                }
                task.isDone = true;
                const filePath = path.join(__dirname, 'tasks.json');
                fs.writeFileSync(filePath, JSON.stringify(taskList, null, 2));
                return task;
            }
        },
        uncheckTask: {
            type: TaskType,
            args: {
                id: { type: GraphQLInt }
            },
            resolve(parent: any, args: any){
                const task = taskList.find((task:any) => task.id === args.id);
                if (!task) {
                    throw new Error(`Task with id ${args.id} not found`);
                }
                task.isDone = false;
                const filePath = path.join(__dirname, 'tasks.json');
                fs.writeFileSync(filePath, JSON.stringify(taskList, null, 2));
                return task;
            }
        }
    }
})

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

app.listen(5000, ()=> console.log('Server started on port 5000'))
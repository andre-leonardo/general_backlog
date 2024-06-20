pipeline{
    agent any
    stages {
        stage('Clone Repository'){
            steps{
                git branch: 'main',
                    url: 'https://github.com/andre-leonardo/general_backlog.git'
            }
        }
        
        stage('Instal Dependencies'){
            steps{
               sh 'npm install'
            }
        }
        stage('install pm2'){
            steps{
               sh 'npm install pm2 -g'
            }
        }
        stage('Deploy'){
            steps{
               sh 'pm2 start server.js'
            }
        }
    }
}

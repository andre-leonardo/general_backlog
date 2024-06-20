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
                bat 'npm install'
            }
        }
        stage('install pm2'){
            steps{
                bat 'npm install pm2 -g'
            }
        }
        stage('Deploy'){
            steps{
                bat 'pm2 start server.js'
            }
        }
    }
}

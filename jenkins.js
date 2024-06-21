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
                sh 'nvm use 20.14.0'
               sh 'npm install'
            }
        }
        stage('Deploy'){
            steps{
               sh 'node app.js'
            }
        }
    }
}

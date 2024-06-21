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
        stage('Deploy'){
            steps{
               sh 'node app.js'
            }
        }
    }
}

Connecting to Back end on local host port 8080

edit the src/environments/environment.ts file
  adding to the base api urls (
  http://localhost:8080
  )
  //add to the
  baseApiUrl: window['env']['fineractApiUrl'] || 'https://localhost:8080',

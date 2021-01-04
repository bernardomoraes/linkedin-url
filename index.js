const puppeteer = require('puppeteer');
const {google} = require('googleapis');
const keys = require('./keys.json');
const { finished } = require('stream');

(async () => {
    try {
        
        // INICIAR O PUPPETEER E ACESSAR O LINKEDIN
        const browser = await puppeteer.launch({headless: false, executablePath: '/usr/bin/chromium-browser'});
        const page = await browser.newPage();
        await page.goto('https://www.linkedin.com/feed/');
        await page.click('a.main__sign-in-link');
        await page.waitForSelector('input#password');
        await page.waitForTimeout(2000);
        let username = 'bernardo.moraes.silva@gmail.com';
        let password = 'intera123';

        // CONECTAR E PEGAR OS DADOS DA PLANILHA
        const client = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        let isAuthorized = await isClientAuthorized(client)
        // LOGARA NO LINKEDIN
        await login(username, password, page);

        if (isAuthorized) {
            // COLETAR OS DADOS DA PLANILHA
            let dataSheets = await getDataFromSheets(client);
            console.log('DataArray: ', dataSheets)
            // EXECUTAR O SCRIPT COM OS DADOS COLETADOS
            let linkedinFinalUrls = await executeScript(page, dataSheets)
            await updateDataToSheets(client, linkedinFinalUrls)
        }
        console.log('finished')
    } catch (e) {
        console.log(e);
    }
})();

// FUNÇÕES
async function login(username, password, page) {
    let usernameInput = 'input#username'
    let passwordInput = 'input#password'

    await page.type(usernameInput, username, {delay: 200}) 
    await page.type(passwordInput, password, {delay: 200}) 

    let loginButton = await page.$('button.btn__primary--large');
    await loginButton.click()
    await page.waitForSelector('.global-nav__logo')
}

async function getDataFromSheets(client){
    console.log('GS Runned')
    const gsapi = google.sheets({version: 'v4', auth: client})

    const opt = {
        spreadsheetId: '1H-gjwhdOJ8KEX4HJDHQCv_4BePXEPP-cHubNqaMwR8s',
        range: 'Data!A1:B5' // Área de execução
    }

    let data = await gsapi.spreadsheets.values.get(opt);

    let dataArray = data.data.values;
    
    return dataArray
}

async function updateDataToSheets(client, data) {
    const gsapi = google.sheets({version:'v4', auth: client})

    const updateOptions = {
        spreadsheetId: '1H-gjwhdOJ8KEX4HJDHQCv_4BePXEPP-cHubNqaMwR8s',
        range: 'Data!B1',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: data
        }
    }
    let response = await gsapi.spreadsheets.values.update(updateOptions);
    console.log(response.status)
}

async function executeScript (page, sheetsData) {
    console.log(sheetsData)
    if (sheetsData) {
        let linkedinFinalUrls = []
        for (row of sheetsData) {
            if (row[0]){
                await page.goto(row[0]);
                let testdata = [
                    ['First'],
                    ['Second'],
                    ['Third'],
                    ['Fourth'],
                    ['Last']
                ]
                linkedinFinalUrls.push([await page.url()])
            }
        }
        console.log(linkedinFinalUrls)
        return linkedinFinalUrls
    }
}

async function isClientAuthorized(client) {
    try {
        await client.authorize()
        console.log('Connected')
        return true;

    } catch (e) {
        console.log(e)
        console.log('Woops! Something went wrong')
        return false;
    }
    
    // console.log("response: ", response)
    // return response
}

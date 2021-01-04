const puppeteer = require('puppeteer');
const {google} = require('googleapis');
const keys = require('./keys.json');

(async () => {
    try {
        // INICIAR O PUPPETEER E ACESSAR O LINKEDIN
        const browser = await puppeteer.launch({headless: false, executablePath: '/usr/bin/chromium-browser'});
        const page = await browser.newPage();
        await page.goto('https://www.linkedin.com/feed/');
        await page.click('a.main__sign-in-link');// Clicking the link will indirectly cause a navigation
        await page.waitForSelector('input#password'); // The promise resolves after navigation has finished
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
        // (async () => console.log(await isClientAuthorized(client)))()
        
        let isAuthorized = await isClientAuthorized(client)

        await login(username, password, page);

        if (isAuthorized) {
            let dataSheets = await getDataFromSheets(client);
            await executeScript(page, dataSheets)
        }

        
    // EXECUTAR O SCRIPT COM OS DADOS COLETADOS
        

        

        console.log('finished')        

        /* let anunciarVagaNovamenteButton = "button[data-control-name = 'hiring_job_repost']";
        await page.waitForSelector(anunciarVagaNovamenteButton);
        await page.click(anunciarVagaNovamenteButton);
        await page.waitForTimeout(2000);

        let newPages = await browser.pages();
        
        let talentSolutionsPage = await newPages[2];
        await talentSolutionsPage.waitForSelector('button.wow-page-online__submit-button');
        await talentSolutionsPage.click('button.wow-page-online__submit-button')
        await talentSolutionsPage.screenshot({path: 'TSP.png'});
        
        let competenciasListSelector = ".job-skill-typeahead ul li[data-test-job-skill-pill-dismiss]";

        await talentSolutionsPage.waitForSelector(competenciasListSelector);
        let competenciasLabels = await talentSolutionsPage.$$(competenciasListSelector)
        for (let i = 0; i < competenciasLabels.length ; i++ ) {
            await talentSolutionsPage.click(competenciasListSelector)
            await talentSolutionsPage.waitForTimeout(1000)
        }

        let competenciasInputSelector = ".job-skill-typeahead ul li[data-test-job-skill-pill-input]";

        // Change to get the list of googlesheets in JSON for preference

        for (let i = 0; i < 4 ; i++ ) {
            await talentSolutionsPage.click(competenciasInputSelector);
            await talentSolutionsPage.type(competenciasInputSelector, 'Testes', {delay: 200});
            await talentSolutionsPage.waitForTimeout(3000);
            await talentSolutionsPage.keyboard.press('ArrowDown');
            await talentSolutionsPage.waitForTimeout(1000);
            await talentSolutionsPage.keyboard.press('Enter');
            await talentSolutionsPage.waitForTimeout(1000);
        }

        // Click em continuar Page 01
        let continueButton = await talentSolutionsPage.$('button[data-live-test-online-description-continue]');
        await continueButton.click();
        
        // Copiar o endereço do site
        let continueButtonSecondPageSelector = 'button[data-live-test-online-assessments-continue="continue"]'
        await talentSolutionsPage.waitForSelector(continueButtonSecondPageSelector)
        let enderecoElementValue = await talentSolutionsPage.evaluate(() => {
            let enderecoElementValue = document.querySelector("input[name='online-apply-method-value']").value
            
            return enderecoElementValue;
        })

        // REGISTRAR O VALOR NO EXCEL
            // Printar valor do Endereço
            console.log(enderecoElementValue)


        // Click em continuar Page 02
        await talentSolutionsPage.click(continueButtonSecondPageSelector)

        let backbutton = 'button[data-control-name="back"]'

        await talentSolutionsPage.waitForSelector('button[data-live-test-online-budget-promote]')

        for (let i = 0; i<2; i++) {
            await talentSolutionsPage.waitForSelector(backbutton)
            await talentSolutionsPage.click(backbutton)
            await talentSolutionsPage.waitForTimeout(1000)
        } */
        

        
    } catch (e) {
        console.log(e);
    }
})();
  /* await page.evaluate(() => { // Toda essa função será executada no Browser

    

  }) */
//   await browser.close();

async function login(username, password, page) {
    let usernameInput = 'input#username'
    let passwordInput = 'input#password'

    await page.type(usernameInput, username, {delay: 200}) 
    await page.type(passwordInput, password, {delay: 200}) 

    let loginButton = await page.$('button.btn__primary--large');
    await loginButton.click()
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
    console.log('DataArray: ', dataArray)
    return dataArray
}

async function executeScript (page, sheetsData) {
    console.log(sheetsData)
    if (sheetsData) {
        for (row of sheetsData) {
            await page.goto(row[0]);
            await page.waitForSelector('.pv-top-card__image')
            console.log(page.url())
        }
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

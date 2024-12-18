const puppeteer = require("puppeteer")

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForVerifyDisplayed(page, xPath, timeout) {
    let rs = true
    try {
        await page.waitForSelector(xPath, {
            visible: true,
            timeout
        })
    } catch (error) {
        rs = false
    }
    return rs
}

function isTokenExpired(token) {
    try {
        if (token.startsWith('Bearer')) token = token.split(' ')[1]
        const decoded = jwt.decode(token)  // Decode without verifying signature
        const currentTime = Math.floor(Date.now() / 1000) - 300  // Get current time in seconds

        if (decoded.exp && decoded.exp < currentTime) {
            return true  // Token has expired
        } else {
            return false // Token is still valid
        }
    } catch (error) {
        console.error('Invalid token', error)
        return true  // Treat as expired if token is invalid
    }
}

async function clickElement(page, xPath, timeout = 10000) {

    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            // Click the first element found
            await elements[0].click()
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

async function tapElement(page, xPath, timeout = 10000) {
    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            const boundingBox = await elements[0].boundingBox()
            if (boundingBox) {
                await page.touchscreen.tap(
                    boundingBox.x + boundingBox.width / 2,
                    boundingBox.y + boundingBox.height / 2
                )
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

async function clickElementBox(page, xPath, timeout = 10000) {
    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            const boundingBox = await elements[0].boundingBox()
            if (boundingBox) {
                await page.mouse.click(
                    boundingBox.x + boundingBox.width / 2,
                    boundingBox.y + boundingBox.height / 2
                    , {
                        delay: 35
                    })
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

async function clickAllElement(page, xPath, timeout = 10000) {
    try {
        await page.waitForSelector(xPath, {timeout})
        // Find the element
        const elements = await page.$$(xPath)
        if (elements.length > 0) {
            // Click the first element found
            for (let i = 0; i < elements.length; i++) {
                await elements[i].click()
                await delay(100)
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error('click loi', xPath, e.message)
    }
}

function getXpathLast(txt) {
    txt = txt.toLowerCase()
    return `xpath=(//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'${txt.toLowerCase()}')] )[last()]`
}

async function showFrameNotification(page, text, backgroundColor) {
    await page.evaluate((textContent, bgColor) => {
        const overlay = document.createElement('div')
        overlay.style.position = 'fixed'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.width = '100vw'
        overlay.style.height = '100vh'
        overlay.style.backgroundColor = bgColor
        overlay.style.display = 'flex'
        overlay.style.flexDirection = 'column'
        overlay.style.alignItems = 'center'
        overlay.style.justifyContent = 'flex-start' // Align text at the top
        overlay.style.paddingTop = '20px' // Add some spacing from the top
        overlay.style.zIndex = '9999' // Ensure it's on top of other elements
        overlay.style.pointerEvents = 'none' // Allow clicks to pass through the overlay

        const textElement = document.createElement('h1')
        textElement.innerText = textContent
        textElement.style.color = 'white'
        textElement.style.fontSize = '4em' // Increase font size
        textElement.style.margin = '0' // Remove default margin
        textElement.style.pointerEvents = 'auto' // Allow clicks on the text if needed

        overlay.appendChild(textElement)
        document.body.appendChild(overlay)
    }, text, backgroundColor)
}

async function isLoginTelegram(page) {
    try {
        await page.goto('https://web.telegram.org/a/')
        console.log('Xpath login: ', getXpath('log in to telegram', 'in to telegram'))
        await page.waitForSelector(getXpath('in to telegram', 'in to telegram'), {
            visible: true,
            timeout: 20000
        })
        await showFrameNotification(page, 'Need Login', 'rgba(255, 0, 0, 0.2)')//'rgba(0, 128, 0, 0.2)' green
        await delay(10000)
        return false
    } catch (e) {
        return true
    } finally {
        await page.close()
    }
}

function getTelegramChanelJoinUrl(url) {
    //https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3DCats_housewtf
    //https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fjoin%3Finvite%3D3OpsBLZ18FQwY2M6
    if (url.startsWith('https://t.me/+')) {
        return `https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fjoin%3Finvite%3D${url.split('https://t.me/+').pop()}`
    }
    return `https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D${url.split('https://t.me/').pop()}`
}

function getXpathClsIndex(cls, index) {
    return `xpath=(//*[contains(@class, "${cls}")])[${index}]`
}

function getXpathClsLast(cls) {
    return `xpath=(//*[contains(@class, "${cls}")])[last()]`
}

function getXpath(en, vi) {
    if (!vi) {
        vi = en
    }
    return `xpath=//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${en}") or contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${vi}")]`
}

function getXpathSelect(p) {
    return `xpath=(${p})`
}

let browser
let page
step("Start browser", async () => {
    browser = await puppeteer.launch({
        headless: false,
        args: [`--window-size=1920,1080`],
        defaultViewport: {
            width:1920,
            height:1080
        }
    })
    page = await browser.newPage()
    page.setViewport({ width: 1920, height: 1080 })
})

step("Login <arg0> and <arg1>", async function (username, password) {
    await page.goto(`https://dev-velein-bcc.atis.vn`, {waitUntil: "networkidle2"})
    await delay(2000)
    await clickElement(page, getXpathClsLast("login-form-button"), 5000);
    await delay(1000)
    await page.keyboard.type(username)
    await page.keyboard.press("Tab")
    await page.keyboard.type(password)
    await page.keyboard.press("Enter")
    await delay(5000)
})
//Case1: Tìm kiếm
// step("Search <arg0>", async function (searchtext) {
//     await clickElement(page,getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/aside/div/ul/li[3]"),5000);
//     await delay(1000)
//     await clickElement(page,getXpathClsLast("ant-input-outlined"),5000);
//     await delay(1000)
//     await page.keyboard.type(searchtext)
//     await page.keyboard.press("Enter")
//     await delay(5000)
// })
//Case2: Lọc trạng thái
// step("Status <arg0>", async function (status) {
//     await clickElement(page, getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/aside/div/ul/li[3]"), 5000);
//     await delay(1000)
//     await clickElement(page, getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/div/main/div/div[1]/div[2]/div[1]/div/div/div[1]/button/div"), 5000);
//     await delay(1000)
//     await clickElement(page, getXpathClsIndex('ant-dropdown-menu-item ant-dropdown-menu-item-only-child', 2), 10000)
//     await delay(10000)
//     await page.select(status)
//     await page.click.press("Advise")
//     await delay(5000)
// })
//Case3: Lọc chiến dịch
// step("Campaign <arg0>", async function (Campaign) {
//     await clickElement(page, getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/aside/div/ul/li[3]"), 5000);
//     await delay(1000)
//     await clickElement(page, getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/div/main/div/div[1]/div[2]/div[1]/div/div/div[1]/button/div"), 5000);
//     await delay(1000)
//     await clickElement(page, getXpathClsIndex('ant-dropdown-menu-item ant-dropdown-menu-item-only-child', 2), 10000)
//     await delay(10000)
//     await page.select(status)
//     await page.click.press("Advise")
//     await delay(5000)
// })
//Case4: Cấp đơn
step("Status <arg0>", async function (status) {
    await clickElement(page, getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/aside/div/ul/li[3]"), 5000);
    await delay(1000)
    await clickElement(page, getXpathSelect("//*[@id=\"root\"]/div/div[1]/div[1]/div/main/div/div[1]/div[2]/div[3]/div/div/div/div/div/table/tbody/tr[2]/td[8]/div/button"), 5000);
    await delay(1000)
    await clickElement(page, getXpathSelect("//*[@id=\"policy-drawer\"]/div[2]/div/div/form/div/div[4]/div[1]/div[1]/div[3]/div/div[3]/div"), 5000);
    await delay(1000)
    await clickElement(page,getXpathClsLast("ant-input-outlined"),5000);
    await delay(1000)
})
//Biển số xe
step("license_plate <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"license_plate\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    await page.keyboard.press("Tab")
    await delay(5000)
})
//Số khung
step("vin_number <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"vin_number\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    await page.keyboard.press("Tab")
    await delay(1000)
})
//Số máy
step("engine_number <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"engine_number\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    // await page.keyboard.press("Tab")
    await delay(1000)
})
step("phone <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"policy-drawer\"]/div[2]/div/div/form/div/div[4]/div[1]/div[1]/div[2]/div"),5000);
    await delay(1000)
    await clickElement(page,getXpathSelect("//*[@id=\"phone\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    await page.keyboard.press("Tab")
    await delay(1000)
})
step("name <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"name\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    await page.keyboard.press("Tab")
    await delay(1000)
})
step("street <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"street\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    await page.keyboard.press("Tab")
    await delay(1000)
})
step("comment <arg0>", async function (text) {
    await clickElement(page,getXpathSelect("//*[@id=\"comment\"]"),5000);
    await delay(1000)
    await page.keyboard.type(text)
    await page.keyboard.press("Tab")
    await delay(1000)
    await clickElement(page,getXpathSelect("//*[@id=\"is_bank\"]"),5000);
    await delay(1000)
})
// step("search <arg0>", async function (combobox) {
//     await clickElement(page,getXpathSelect("//*[@id=\"is_bank\"]"),5000);
//     await delay(1000)
//
// })
;


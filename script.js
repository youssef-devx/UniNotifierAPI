const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch")
const JSDOM = require("jsdom").JSDOM

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors("*"))

const labels = [
  {
    label: "إعلانات طلبة الإجازة في الدراسات الأساسية",
    url: "https://www.flsh.umi.ac.ma/?page_id=2422",
  },
  {
    label: "إعلانات طلبة الإجازة المهنية",
    url: "https://www.flsh.umi.ac.ma/?page_id=2419",
  },
  {
    label: "إعلانات وحدة المهارات الحياتية والذاتية (MTU)",
    url: "https://www.flsh.umi.ac.ma/?page_id=2419",
  },
  {
    label: "إعلانات وحدة اللغات (Rosetta Stone)",
    url: "https://www.flsh.umi.ac.ma/?page_id=3621",
  },
  {
    label: "إعلانات طلبة االماستر والماستر المتخصص",
    url: "https://www.flsh.umi.ac.ma/?page_id=2417",
  },
  {
    label: "إعلانات طلبة الدكتوراه",
    url: "https://www.flsh.umi.ac.ma/?page_id=2085",
  },
  {
    label: "إعلانات طلبة التكوين المستمر",
    url: "https://www.flsh.umi.ac.ma/?page_id=2613",
  },
  {
    label: "إعلانات إدارية",
    url: "https://www.flsh.umi.ac.ma/?page_id=4511",
  },
]

async function getPublications(label) {
  const html = await getHtml(label.url)
  const document = new JSDOM(html).window.document

  const publications = Array.from(document.querySelectorAll(".panel")).map(el => {
    const linkEl = el.querySelector("a")
    const title = linkEl.textContent.replace(/\n|\t/g, "")
    const url = linkEl.href
    return { label: label.label, title, url }
  })

  return publications
}

function getHtml(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
    .then(async r => resolve(await r.text()))
    .catch(reject)
  })
}

function getFetchedPublications() {
  const fetchedPublications = labels.slice(0,1).map(async label => {
    const publications = await getPublications(label)
    const lastThreePublications = publications.slice(0, 3)
    fetchedPublications.push(...lastThreePublications)
  })

  return fetchedPublications
}

// getFetchedPublications()

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.post("/publications", (req, res) => {
  const publicationsToFetch = req.body.publicationsToFetch

  const publicationsPromises = publicationsToFetch.map(label => getPublications(label))
  Promise.all(publicationsPromises).then(labelsPublications => {
    res.json(labelsPublications)
  })
})

app.listen(PORT, () => console.log("Server started on port", PORT))
const getLegislatorByIdUrl = `${api_domain()}/legislators/`;

function restApiRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}


function createBillRecordRows(bills, rowCellId, billTable, billCodeFieldId, billTitleFieldId, noResultViewId) {
    if (!bills || bills.length == 0) {
        const style = document.getElementById(rowCellId);
        const row = style.cloneNode(true);
        row.setAttribute('id', '');
        row.style.display = 'block';
        row.querySelector(`#${noResultViewId}`).style.display = 'block';
        row.querySelector(`#${billCodeFieldId}`).style.display = 'none';
        row.querySelector(`#${billTitleFieldId}`).style.display = 'none';
        row.style.pointerEvents = 'none';
        billTable.appendChild(row);
    } else {
        bills.forEach(cb => {
            const style = document.getElementById(rowCellId);
            const row = style.cloneNode(true);
            row.setAttribute('id', '');
            row.style.display = 'block';
            row.querySelector(`#${noResultViewId}`).style.display = 'none';
            row.querySelector(`#${billCodeFieldId}`).textContent = cb.bill_code;
            row.querySelector(`#${billTitleFieldId}`).textContent = cb.bill_title;
            row.style.pointerEvents = 'none';
            billTable.appendChild(row);
        });
    }
}

const getLegislatorDetail = async () => {
    let legislatorId = -1;
    if (location.href.match(/id=(\d+)/g)) {
        legislatorId = new URL(location.href).searchParams.get("id");
    }
    if (legislatorId == -1) return;

    let legislator = await restApiRequest('GET', `${getLegislatorByIdUrl}${legislatorId}`);

    document.getElementById("fullName").textContent = legislator.full_name;
    document.getElementById("role-state").textContent = `${legislator.role} of ${legislator.district}`;
    document.getElementById("party").textContent = legislator.political_party;
    document.getElementById("elected-year").textContent = legislator.elected_year;

    let isSenator = legislator.role == 'Senator';
    let billsToPush = '', hasCosponsored = false;
    // Move this to backend
    if (isSenator &&
        (legislator.cosponsored_bills.includes(b => b.bill_code == 'S. 490')
            || legislator.sponsored_bills.includes(b => b.bill_code == 'S. 490'))) {
        billsToPush += 'S. 490 Hong Kong Economic and Trade Office (HKETO) Certification Act\n';
        hasCosponsored = true;
    }
    if (!isSenator &&
        (legislator.cosponsored_bills.includes(b => b.bill_code == 'H.R. 1103')
            || legislator.sponsored_bills.includes(b => b.bill_code == 'H.R. 1103'))) {
        billsToPush += 'H.R. 1103 Hong Kong Economic and Trade Office (HKETO) Certification Act\n';
        hasCosponsored = true;
    }

    document.getElementById("billsToCosponsor").textContent = billsToPush;
    document.getElementById('cosponsorBillDiv').hidden = billsToPush == '';
    legislator.bio_text = legislator.bio_text.replaceAll('\n', '<br>');
    document.getElementById("bioText").innerHTML = legislator.bio_text;
    document.getElementById('headshot').src = legislator.photo_url;

    document.getElementById('contact-office').innerHTML =
        `<a href=\"tel:${legislator.district_phone_number}\">Contact District Office</a>`;
    document.getElementById('contact-office').style.color = "";

    const committeeBlock = document.getElementById('committee-block');
    const committees = legislator.committees.map(l => l.committee);
    committees.forEach(committee => {
        const style = document.getElementById('committee');
        const row = style.cloneNode(true);
        row.setAttribute('id', '');
        row.style.display = 'block';
        row.textContent = committee;
        committeeBlock.append(row);
    });

    const cosponsoredBillTable = document.getElementById("cosponsored-bill-table");
    createBillRecordRows(
        legislator.cosponsored_bills,
        'cosponsored-bill-row',
        cosponsoredBillTable,
        'bill-code',
        'bill-title',
        'cosponsor-no-result');

    const yeaBillTable = document.getElementById("yea-bill-table");
    const yeaBills = legislator.voting_stats.filter(v => v.vote.toLowerCase() == 'yea');
    createBillRecordRows(
        yeaBills,
        'yea-bill-row',
        yeaBillTable,
        'yea-bill-code',
        'yea-bill-title',
        'yes-vote-no-result');
    document.getElementById("yea-bill-count").textContent = yeaBills.length;

    const nayBillTable = document.getElementById("nay-bill-table");
    const nayBills = legislator.voting_stats.filter(v => v.vote.toLowerCase() == 'nay');
    createBillRecordRows(
        nayBills,
        'nay-bill-row',
        nayBillTable,
        'nay-bill-code',
        'nay-bill-title',
        'nay-vote-no-result');
    document.getElementById("nay-bill-count").textContent = nayBills.length;
}

(async () => {
    await getLegislatorDetail();
})();

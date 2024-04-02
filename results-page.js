    const currentBillsUrl = `${api_domain()}/bills/current`;
    const zipcodeLookupUrl = `${api_domain()}/legislators/zipcode/`;
    const addressLookupUrl = `${api_domain()}/legislators/address`;
    const emailTweetTemplateUrl = `${api_domain()}/templates`;

    let requestedZipcode = "";

    const buildEmailTweetTemplateUrl = (legislator_id, zipcode, media) => {
        const campaign_name = localStorage.getItem("current_campaign");
        console.log("campaign_name: "+ campaign_name);
        return `${emailTweetTemplateUrl}?legislator_id=${legislator_id}&zipcode=${zipcode}&media=${media}&campaign_name=${campaign_name}`;
    }

    const lookUpLegislators = async () => {
        let legislatorResult = [];
        let request = new XMLHttpRequest();

        const searchParams = new URL(location.href).searchParams;
        if (location.href.match(/address=(\d+)/g)) {
            const addressInput = searchParams.get("address");
            legislatorResult = await restApi('POST', addressLookupUrl, { address: addressInput });

            // TODO 
            let matches = addressInput.match(/[0-9]{5}/g);
            requestedZipcode = matches && matches.length > 0 ? matches[matches.length - 1] : "";
        } else {
            requestedZipcode = searchParams.get("zipcode");
            const url = zipcodeLookupUrl + requestedZipcode.toString();
            legislatorResult = await restApi('GET', url);
        }

        const legislators = legislatorResult;
        const cardContainer = document.getElementById("Cards-Container");

        currentBills = await restApi('GET', currentBillsUrl);
        currentBillCode = []
        sponsorIds = []
        currentBills.forEach(cb => {
            currentBillCode.push(cb["bill_code"])
            sponsorIds.push(cb["sponsor_id"])
        })

        legislators.forEach(legislator => {
            const style = document.getElementById('samplestyle')
            const card = style.cloneNode(true)
            card.setAttribute('id', '');
            card.style.display = 'block';

            card.querySelector('#headshot').src = legislator.photo_url;
            card.querySelector('#fullName').textContent = legislator.full_name;
            card.querySelector('#fullName').addEventListener('click', function () {
                location.href = `/legislator?id=${legislator.id}`;
            });

            card.querySelector('#bioText').textContent = legislator.bio_text;
            card.querySelector('#role').textContent = legislator.role.split('US ')[1];
            card.querySelector('#party').textContent = legislator.political_party;
            card.querySelector('#district').textContent = legislator.district;
            card.querySelector('#electedYear').textContent = legislator.elected_year;

            let cosponsoredStatusDiv = card.querySelector('#cosponsor-status-div');
            const campaign_name = localStorage.getItem("current_campaign");
            if(!campaign_name.includes("HKETO")) {
                cosponsoredStatusDiv.style.display = "none";
            } else {
                cosponsoredStatusDiv.style.display = "block";
                let cosponsoredStatus = card.querySelector('#cosponsor_status');
                let hasCosponsored = legislator.cosponsored_bills.filter(cb => currentBillCode.includes(cb.bill_code)).length > 0;
                cosponsoredStatus.textContent = hasCosponsored ? "Cosponsored" : "Yet to cosponsor";
                if (hasCosponsored && (sponsorIds.includes(legislator.id))) {
                    cosponsoredStatus.textContent = "INTRODUCED BILL";
                }
                cosponsoredStatus.style.color = hasCosponsored ? "white" : cosponsoredStatus.style.color;
                cosponsoredStatusDiv.style.backgroundColor = hasCosponsored ? "darkseagreen" : cosponsoredStatusDiv.style.backgroundColor;
            }

            let tweetButton = card.querySelector("#tweetButton");
            tweetButton.textContent = `Tweet`;
            let emailButton = card.querySelector("#emailButton");
            emailButton.textContent = `Email`;
            // email template modal
            let modalLink = card.querySelector("#email-template-link");

            const gatherEmailTemplates = async (legislator, requestedZipcode, openEmailApp = false) => {
                if (!requestedZipcode) {
                    requestedZipcode = ""
                }
                const templateUrl = buildEmailTweetTemplateUrl(legislator.id, requestedZipcode, "Email")
                let template_data = (await restApi('GET', templateUrl));

                subject = template_data.subject;
                body = template_data.template;

                const isRep = legislator.role == 'US Representative';
                let emailTo = legislator.staff_emails.join(',');
                if (openEmailApp) {
                    body = body.replaceAll('\\n', '%0d%0a');
                } else {
                    emailTo = emailTo.replaceAll(',', ', ');
                    body = body.replaceAll('\\n', '<br />');
                }

                return [emailTo, subject, body]
            };

            tweetButton.addEventListener('click', async function () {
                const templateUrl = buildEmailTweetTemplateUrl(legislator.id, requestedZipcode, "Twitter")
                let tweet_template = (await restApi('GET', templateUrl)).template;

                content_and_hashtags = tweet_template.split("#");
                tweet_text = content_and_hashtags.shift().trim();
                hashtags = ["call4hk"]
                while(content_and_hashtags.length > 0) {
                    hashtags.unshift(content_and_hashtags.shift().trim())
                }

                twitter_handle = legislator.twitter_username.split("/").pop();
                tweetContent = `%40${twitter_handle} ${tweet_text.replaceAll('\\n', '')}`;
                const url = `http://twitter.com/share?text=${tweetContent}&hashtags=${hashtags.join(",")}`;

                setTimeout(function () {
                    window.open(url, '_blank').focus();
                }, 50);
                // window.location.assign(url); 
            });

            emailButton.addEventListener('click', async function () {
                const emailTemplateResult = await gatherEmailTemplates(legislator, requestedZipcode, openEmailApp = true);
                const emailTo = emailTemplateResult[0];
                const emailSubject = emailTemplateResult[1];
                const body = emailTemplateResult[2];

                const url = `mailto:${emailTo}?subject=${emailSubject}&body=${body}`;

                setTimeout(function () {
                    window.open(url, '_blank').focus();
                }, 50);
                // window.location.assign(url); 
            });

            modalLink.addEventListener('click', async function () {
                const emailTemplateResult = await gatherEmailTemplates(legislator, requestedZipcode);
                const emailTo = emailTemplateResult[0];
                const emailSubject = emailTemplateResult[1];
                const body = emailTemplateResult[2];

                const contentBlock = document.getElementById('content-block');
                let content = contentBlock.cloneNode(true);
                content.setAttribute('id', '');
                content.style.display = 'block';
                content.querySelector('#email-addresses').textContent = emailTo;
                content.querySelector('#email-subject').textContent = emailSubject;
                content.querySelector('#email-body').innerHTML = body;

                const contentContainer = document.getElementById("template-content-container");
                while (contentContainer.childNodes.length > 1) {
                    contentContainer.removeChild(contentContainer.lastChild);
                }
                contentContainer.append(content);

                document.getElementById("template-modal").style.display = "block";
                document.getElementById("template-modal").style.opacity = "100";
            });

            // email template modal
            let modalCrossButton = document.getElementById("modal-cross");
            modalCrossButton.addEventListener('click', async function () {
                document.getElementById("template-modal").style.display = "none";
                document.getElementById("template-modal").style.opacity = "0";
            });

            cardContainer.appendChild(card);
        });
    }

    (async () => {
        try {
            let find_legislator_button = document.querySelector("#find-button-nav");
            let zipcode_entry_view = document.querySelector("#zipcode-entry-view");
            let find_legislator_button_mobile = document.querySelector("#find-legislator-button-mobile");
    
            const cur_url = window.location.href;
            console.log("cur_url: " + cur_url);
            if(cur_url.includes("/results")) {
                find_legislator_button.style.display = "none";
                zipcode_entry_view.style.display = "none";
                find_legislator_button_mobile.style.display = "none";
            } else {
                find_legislator_button.style.display = "block";
                zipcode_entry_view.style.display = "block";
                find_legislator_button_mobile.style.display = "block";
            }
        } catch (error) {}

        console.log(localStorage.getItem("current_campaign"));
        await lookUpLegislators();
    })();

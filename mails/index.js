const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendActivationCode = async(email,code,name)=>{
  
    const msg = {
        to: email,
        from: 'noreply@christembassylz3.org',
        subject: 'LZ3 Foundation School | Account Activation',
        html: `<p>Hi <strong>${name}</strong>,</p>
        <p>Your account is ready. <br />Use the following password to login.</p><br />
        <h2>${code}</h2>
          <br />
        <p>Cheers,<br />
          CE Lagos Zone 3 IT &amp; Data Services</p>`,
      };

      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error(error);
        if (error.response) {
          console.error(error.response.body)
        }
      }
}



module.exports ={sendActivationCode}
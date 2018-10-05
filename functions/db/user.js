const functions = require("firebase-functions")
const admin = require("firebase-admin")
const crypto = require("crypto")
const mailTransport = require("../utils/mailer")
const functionsURL = functions.config().functions.url

module.exports = functions.auth.user().onCreate(user => {
  const activationToken = crypto.randomBytes(24).toString("hex")

  return admin
    .auth()
    .updateUser(user.uid, {
      disabled: true
    })
    .then(() => {
      return Promise.all([
        admin
          .firestore()
          .collection("settings")
          .doc("settings")
          .get(),
        admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set(
            {
              id: user.uid,
              activationToken
            },
            { merge: true }
          )
      ])
    })
    .then(([settingsSnapshot]) => {
      const settings = settingsSnapshot.data()
      const activationUrl = `${functionsURL}/activate_user/${activationToken}`
      const mailer = mailTransport(settings.email)
      return mailer.sendMail(
        {
          from: "Social VR",
          to: settings.emailRecepients.join(","),
          subject: "New user registered",
          html: `User with email ${
            user.email
          } joined to SocialVR. Click <a target=_blank href='${activationUrl}'>here</a> to activate his account`
        },
        (error, info) => {
          console.log(error, info)
        }
      )
    })
})

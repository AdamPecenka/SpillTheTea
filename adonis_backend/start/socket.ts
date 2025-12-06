import app from "@adonisjs/core/services/app";
import WsServiceBE from "#services/wsServiceBE";


app.ready(() => {
    WsServiceBE.onBoot();
})

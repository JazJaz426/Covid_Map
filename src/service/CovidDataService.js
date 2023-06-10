import axios from "axios"

export const CovidDataService = {
    getAllCountyCases: function() {
        return axios.get('https://disease.sh/v3/covid-19/jhucsse/counties'); //Promise
    }
}
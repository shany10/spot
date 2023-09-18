class UserModel {
    
    constructor(user) {    
        this.name = user.name;
        this.lastname = user.lastname;
        this.email = user.email;
        this.password = user.password;
        this.hashPassword
    }

    model() {

        if(!this.name) return {'error': 'name'};
        if(!this.lastname) return {'error': 'lastname'};
        if(!this.email) return {'error': 'email'};
        if(!this.password) return {'error': 'password'};

        return {
            name: this.name,
            lastname: this.lastname,
            email:this.email,
            password:this.password,
            hashPassword:this.hashPassword
        };
    }
}
    
module.exports =  UserModel;

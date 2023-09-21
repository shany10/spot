class UserModel {
    
    constructor(user) {    
        this.name = user.name;
        this.lastname = user.lastname;
        this.email = user.email;
        this.password = user.password;
        this.hashPassword
        this.create_at
    }

    model() {

        if(!this.name) return {'error': 'name absent'};
        if(!this.lastname) return {'error': 'lastname absent'};
        if(!this.email) return {'error': 'email absent'};
        if(!this.password) return {'error': 'password absent'};

        return [
            this.name,
            this.lastname,
            this.email,
            this.password,
            this.create_at
        ];
    }
}
    
module.exports =  UserModel;

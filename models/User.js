const { DataTypes } = require('sequelize');
const BaseModel = require('../bases/BaseModel');

module.exports = (sequelize) => {
  class User extends BaseModel {
     async sendOtp() {
      const otp = Math.floor(1000 + Math.random() * 9000);
      this.otp = otp;
      await this.save();
      console.log(`OTP sent to ${this.email}: ${otp}`);
      return otp;
    }

    async isVerifyOtp(otp) {
      if (!otp || !this.otp) return false;
      
      const storedOtp = String(this.otp);
      const receivedOtp = String(otp);

      if (storedOtp !== receivedOtp) return false;

      this.otp = null;
      this.isVerify = true;

      await this.save({
        fields: ['otp', 'isVerify'],
        validate: false 
      });

      return true;
    }
  }

  User.init({
    id:{
      type:DataTypes.UUID,
      primaryKey:true,
      allowNull:false
    },
    username:{
      type:DataTypes.STRING,
      allowNull:false,
      unique:true
    },
    firstName:{
      type:DataTypes.STRING,
      allowNull:false
    },
    lastName:{
      type:DataTypes.STRING,
      allowNull:false
    },
    displayName:{
      type:DataTypes.STRING,
      allowNull:false
    },
    recoveryEmail:{
      type:DataTypes.STRING,
      validate:{isEmail:true}
    },
    // role_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
  });

  return User;
};
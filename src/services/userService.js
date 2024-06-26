import { defaults } from "lodash";
import db from "../models";
import bcrypt from "bcryptjs";
const salt = bcrypt.genSaltSync(10);
let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      email = email.toString();
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          where: { email: email },
          attributes: ["email", "password", "roleId", "firstName", "lastName"],
          raw: true,
        });
        if (user) {
          let check = bcrypt.compareSync(password, user.password);
          if (check) {
            delete user.password;
            userData.errCode = 0;
            userData.errMessage = "ok";
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "wrong password";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = "user not found!!";
        }
      } else {
        userData.errCode = 1;
        userData.errMessage =
          "Your's email isn't exist in system. Pls try other email! ";
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};
let checkUserEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
          raw: true,
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          raw: true,
          attributes: {
            exclude: ["password"],
          },
        });
      }
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};
let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};
let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email.toString());
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already used, Pls try other email ",
        });
      } else {
        let hashPasswordFromBrcypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBrcypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          gender: data.gender,
          roleId: data.roleId,
          phoneNumber: data.phoneNumber,
          positionId: data.position,
          image: data.avatar,
        });
        resolve({
          errCode: 0,
          errMessage: "ok",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await db.User.findOne({
      where: { id: userId },
    });
    if (!user) {
      resolve({
        errCode: 2,
        errMessage: "The user not exist",
      });
    } else {
      user.destroy();
      resolve({
        errCode: 0,
        errMessage: "The user is deleted",
      });
    }
  });
};
let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          errMessage: "missng required parameter",
        });
      }
      let user = await db.User.findOne({
        // find row has id = data.id
        where: { id: data.id },
      });
      if (user) {
        // if found user
        // gan fisrtname, lastName, address cũ bằng cái mới
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.phoneNumber = data.phoneNumber;
        user.gender = data.gender;
        user.roleId = data.roleId;
        user.positionId = data.position;
        user.image = data.avatar;
        await user.save();
        resolve({
          errCode: 0,
          errMessage: "edit succeed",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "user not found",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let res = {};
        let allcode = await db.allCode.findAll({
          where: { type: typeInput },
        });
        res.errCode = 0;
        res.data = allcode;
        resolve(res);
      }
    } catch (error) {
      reject(error);
    }
  });
};
let bookAppointmentService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        const [user, created] = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
          },
        });
        if (user) {
          await db.booking.create({
            statusId: "S1",
            doctorId: data.doctorId,
            patientId: user.id,
            date: data.date,
            timeType: data.timeType,
          });
        }
        resolve({
          errCode: 0,
          errMessage: "Save hiden infor user succeed",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
  getAllCodeService: getAllCodeService,
  bookAppointmentService,
};

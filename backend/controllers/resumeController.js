const { createClient } = require("@supabase/supabase-js");

// =========================================================
// SUPABASE CONFIG
// =========================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL is missing in backend .env"
  );
}

if (!supabaseKey) {
  throw new Error(
    "SUPABASE_KEY is missing in backend .env"
  );
}

// =========================================================
// GET AUTHENTICATED USER + USER-SCOPED SUPABASE CLIENT
// =========================================================

const getAuthenticatedContext = async (req) => {
  try {
    // =======================================================
    // READ AUTHORIZATION HEADER
    // =======================================================

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return {
        success: false,
        message: "Authorization header is missing",
      };
    }

    // =======================================================
    // CHECK BEARER TOKEN
    // =======================================================

    if (
      !authHeader.startsWith("Bearer ")
    ) {
      return {
        success: false,
        message:
          "Invalid Authorization header format",
      };
    }

    const accessToken =
      authHeader.substring(7).trim();

    if (!accessToken) {
      return {
        success: false,
        message: "Access token is missing",
      };
    }

    // =======================================================
    // BASIC SUPABASE CLIENT
    // =======================================================

    const supabaseAuthClient =
      createClient(
        supabaseUrl,
        supabaseKey
      );

    // =======================================================
    // VERIFY USER
    // =======================================================

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAuthClient.auth.getUser(
        accessToken
      );

    if (userError) {
      console.error(
        "Supabase Auth Error:",
        userError
      );

      return {
        success: false,
        message:
          "Invalid or expired authentication token",
      };
    }

    if (!userData?.user?.id) {
      return {
        success: false,
        message:
          "Authenticated user not found",
      };
    }

    // =======================================================
    // USER-SCOPED CLIENT
    //
    // IMPORTANT:
    // This Authorization header makes Supabase/Postgres
    // evaluate RLS using the logged-in user's JWT.
    // =======================================================

    const userSupabase =
      createClient(
        supabaseUrl,
        supabaseKey,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        }
      );

    return {
      success: true,
      user: userData.user,
      userId: userData.user.id,
      supabase: userSupabase,
    };

  } catch (error) {
    console.error(
      "Authentication Context Error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to authenticate user",
    };
  }
};

// =========================================================
// SAVE / UPDATE RESUME
// =========================================================

const createResume = async (req, res) => {
  try {
    // =======================================================
    // AUTHENTICATE USER
    // =======================================================

    const auth =
      await getAuthenticatedContext(req);

    if (!auth.success) {
      return res.status(401).json({
        success: false,
        message: auth.message,
      });
    }

    const userId =
      auth.userId;

    const supabase =
      auth.supabase;

    // =======================================================
    // REQUEST DATA
    // =======================================================

    const {
      name,
      email,
      phone,
      location,

      linkedin,
      github,
      portfolio,

      summary,
      education,
      skills,
      projects,
      experience,
      certifications,
    } = req.body;

    // =======================================================
    // PREPARE RESUME DATA
    //
    // IMPORTANT:
    // user_id comes from authenticated JWT,
    // NOT from req.body.user_id.
    // =======================================================

    const resumeData = {
      user_id: userId,

      name: name || "",
      email: email || "",
      phone: phone || "",
      location: location || "",

      linkedin: linkedin || "",
      github: github || "",
      portfolio: portfolio || "",

      summary: summary || "",
      education: education || "",
      skills: skills || "",
      projects: projects || "",
      experience: experience || "",
      certifications: certifications || "",

      updated_at:
        new Date().toISOString(),
    };

    console.log(
      "===================================="
    );

    console.log(
      "SAVING RESUME"
    );

    console.log(
      "AUTHENTICATED USER ID:",
      userId
    );

    console.log(
      "===================================="
    );

    // =======================================================
    // UPSERT
    // =======================================================

    const {
      data,
      error,
    } = await supabase
      .from("resumes")
      .upsert(resumeData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    // =======================================================
    // SUPABASE ERROR
    // =======================================================

    if (error) {
      console.error(
        "Supabase Save Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "Resume saved successfully:",
      data
    );

    return res.status(200).json({
      success: true,
      message:
        "Resume saved successfully",
      data,
    });

  } catch (error) {
    console.error(
      "Create Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save resume",
    });
  }
};

// =========================================================
// GET RESUME
// =========================================================

const getResume = async (req, res) => {
  try {
    // =======================================================
    // AUTHENTICATE USER
    // =======================================================

    const auth =
      await getAuthenticatedContext(req);

    if (!auth.success) {
      return res.status(401).json({
        success: false,
        message: auth.message,
      });
    }

    const userId =
      auth.userId;

    const supabase =
      auth.supabase;

    console.log(
      "===================================="
    );

    console.log(
      "GET RESUME"
    );

    console.log(
      "AUTHENTICATED USER ID:",
      userId
    );

    console.log(
      "===================================="
    );

    // =======================================================
    // FETCH RESUME
    // =======================================================

    const {
      data,
      error,
    } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // =======================================================
    // SUPABASE ERROR
    // =======================================================

    if (error) {
      console.error(
        "Supabase Fetch Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // =======================================================
    // NO RESUME
    // =======================================================

    if (!data) {
      console.log(
        "No resume found for user:",
        userId
      );

      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "Resume fetched successfully"
    );

    return res.status(200).json({
      success: true,
      message:
        "Resume fetched successfully",
      data,
    });

  } catch (error) {
    console.error(
      "Get Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch resume",
    });
  }
};

// =========================================================
// DELETE RESUME
// =========================================================

const deleteResume = async (req, res) => {
  try {
    // =======================================================
    // AUTHENTICATE USER
    // =======================================================

    const auth =
      await getAuthenticatedContext(req);

    if (!auth.success) {
      return res.status(401).json({
        success: false,
        message: auth.message,
      });
    }

    const userId =
      auth.userId;

    const supabase =
      auth.supabase;

    console.log(
      "===================================="
    );

    console.log(
      "DELETE RESUME"
    );

    console.log(
      "AUTHENTICATED USER ID:",
      userId
    );

    console.log(
      "===================================="
    );

    // =======================================================
    // DELETE FROM SUPABASE
    // =======================================================

    const {
      error,
    } = await supabase
      .from("resumes")
      .delete()
      .eq("user_id", userId);

    // =======================================================
    // DELETE ERROR
    // =======================================================

    if (error) {
      console.error(
        "Supabase Delete Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    console.log(
      "Resume deleted successfully for:",
      userId
    );

    return res.status(200).json({
      success: true,
      message:
        "Resume deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete resume",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createResume,
  getResume,
  deleteResume,
};